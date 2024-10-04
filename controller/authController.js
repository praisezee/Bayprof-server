const { PrismaClient, Prisma } = require( "@prisma/client" );
const { sendErrorResponse, sendSuccessResponse } = require( "../utils/responseHelper" );
const argon = require("argon2");
const jwt = require( "jsonwebtoken" );
const { checkExpiration } = require( '../utils/date' );

const prisma = new PrismaClient();

const createUser = async ( req, res ) =>
{
      const { name, email, password,phone_number } = req.body;
      if ( !name || !email || !password || !phone_number ) return sendErrorResponse( res, 400, "All field must be entered" )
      try {
            const hashedPassword = await argon.hash(password)
            await prisma.user.create( {
                  data: {
                        name,
                        email,
                        phone_number,
                        password: hashedPassword
                  }
            } );

            return sendSuccessResponse( res, 201, "User created" );
      } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if ( e.code === "P2002" )
                  return sendErrorResponse(res,409,"Email Already exist")
      }
            return sendErrorResponse(res,500,"Internal server error",e)
            
      }
};

const loginUser = async ( req, res ) =>
{
      const { email, password } = req.body;
      if ( !email || !password ) return sendErrorResponse( res, 400, "All field must be entered" );
      try {
            const foundUser = await prisma.user.findUniqueOrThrow( { where: { email },include:{transactions:true} } );
            const validatePassword = await argon.verify( foundUser.password, password )
            if ( !validatePassword ) return sendErrorResponse( res, 401, "Invalid credentials" )
            
            const accessToken = jwt.sign(
                  {
                        email: foundUser.email,
                        id: foundUser.id,
                        name:foundUser.name
                  },
                  process.env.ACCESS_TOKEN,
                  {
                  expiresIn: "3h",
                  }
            )

            const refreshToken = jwt.sign(
                  {
                        email: foundUser.email,
                        id: foundUser.id,
                        name:foundUser.name
                  },
                  process.env.REFRESH_TOKEN,
                  {
                  expiresIn: "30d",
                  }
            )

            if ( foundUser.isTrading ) {
                  const currentDate = new Date();
                  const isExpired = checkExpiration( currentDate, foundUser.expire_date )
                  if ( isExpired ) {
                        const update = await prisma.user.update( {
                              where: { email: foundUser.email },
                              data: {
                                    refresh_token: [ refreshToken, ...foundUser.refresh_token ],
                                    isTrading: false,
                                    expire_date: null,
                                    start_date: null,
                                    initial_deposit:null
                              }, include: { transactions: true }
                        } )
                        const user = { ...update, accessToken };
                        delete user.refresh_token
                        delete user.password

                        res.cookie("refreshToken", refreshToken, {
                              httpOnly: true,
                              maxAge: 30 * 24 * 60 * 60 * 1000,
                              sameSite: 'None',
                              secure: true,
                        } );
                        return sendSuccessResponse(res,200,"Login successfully",{user})
                  } else {
                        if ( foundUser.updatedAt < currentDate ) {
                              const fivepercent = (5/100) * foundUser.initial_deposit
                              foundUser.balance += fivepercent
                        }
                        const update = await prisma.user.update( {
                              where: { email: foundUser.email },
                              data: {
                                    refresh_token: [ refreshToken, ...foundUser.refresh_token ],
                                    balance:foundUser.balance
                              },include: { transactions: true }
                        } )
                        const user = { ...update, accessToken };
                        delete user.refresh_token
                        delete user.password
                        res.cookie("refreshToken", refreshToken, {
                              httpOnly: true,
                              maxAge: 30 * 24 * 60 * 60 * 1000,
                              sameSite: 'None',
                              secure: true,
                        } );
                        return sendSuccessResponse(res,200,"Login successfully",{user})
                  }
            }

            await prisma.user.update( {
                  where: { email: foundUser.email },
                  data: { refresh_token:[refreshToken, ...foundUser.refresh_token] },
            } )
            const user = { ...foundUser, accessToken };
            delete user.refresh_token
            delete user.password

            res.cookie("refreshToken", refreshToken, {
                  httpOnly: true,
                  maxAge: 30 * 24 * 60 * 60 * 1000,
                  sameSite: 'None',
                  secure: true,
            } );
            return sendSuccessResponse(res,200,"Login successfully",{user})
      }  catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                  return sendErrorResponse(res,404,"user does not exist")
            }
            console.log( e )
            return sendErrorResponse( res, 500, "Internal server error", e );
      }
};


module.exports={createUser,loginUser}