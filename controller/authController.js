const { sendErrorResponse, sendSuccessResponse } = require( "../utils/responseHelper" );
const argon = require("argon2");
const jwt = require( "jsonwebtoken" );
const { checkExpiration } = require( '../utils/date' );
const User = require( "../model/User" );
const Transaction = require( "../model/Transaction" );

const createUser = async ( req, res ) =>
{
      const { name, email, password,phone_number } = req.body;
      if ( !name || !email || !password || !phone_number ) return sendErrorResponse( res, 400, "All field must be entered" )
      try {
            const hashedPassword = await argon.hash(password)
            await User.create({
                  name,
                  email,
                  phone_number,
                  password: hashedPassword
            })

            return sendSuccessResponse( res, 201, "User created" );
      } catch (e) {
            return sendErrorResponse(res,500,"Internal server error",e)
      }
};

const loginUser = async ( req, res ) =>
{
      const { email, password } = req.body;
      if ( !email || !password ) return sendErrorResponse( res, 400, "All field must be entered" );
      try {
            const foundUser = await User.findOne( { email } ).exec();
            if(!foundUser) return sendErrorResponse(res,404,"User does not exist")
            const transactionsInit = await Transaction.find( { user_id: foundUser._id } );
            const transactions = transactionsInit.map( ( { _id,_doc, ...rest } ) => ( {
                  id: _id,
                  ..._doc
            }))
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
                        foundUser.isTrading = false
                        foundUser.start_date = null
                        foundUser.expire_date = null
                        foundUser.initial_deposit = 0
                  } else {
                        if ( foundUser.updatedAt.getDate() < currentDate.getDate() ) {
                              const fivepercent = (5/100) * foundUser.initial_deposit
                              foundUser.balance += fivepercent
                        }
                  }
            }

            foundUser.refresh_token = refreshToken
            await foundUser.save()
            const user = { ...foundUser._doc, accessToken,id:foundUser._id,transactions };
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
            console.log( e )
            return sendErrorResponse( res, 500, "Internal server error", e );
      }
};


module.exports={createUser,loginUser}