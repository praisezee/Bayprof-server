const jwt = require( "jsonwebtoken" );
const { checkExpiration } = require( '../utils/date' );
const User = require( '../model/User' );
const Transaction = require( '../model/Transaction' );

const refresh = async ( req, res ) =>
{
      try {
            const cookies = req.cookies;
            if ( !cookies?.refreshToken ) return res.sendStatus( 401 );
            const oldRefresh = cookies.refreshToken;

            const foundUser = await User.findOne( {
                  refresh_token: oldRefresh,
            }).exec()
            
            if ( !foundUser ) return res.sendStatus( 403 );
            jwt.verify( oldRefresh, process.env.REFRESH_TOKEN, async ( err, decoded ) =>
            {
                  if ( err || foundUser.email !== decoded.email ) return res.status( 403 );
                  // Creation of new refresh and access token
                  const refreshToken = jwt.sign( {
                        email: foundUser.email,
                        id: foundUser.id,
                        name: foundUser.name
                        }, process.env.REFRESH_TOKEN, {
                        expiresIn: '30d'
                  } )

                  const accessToken = jwt.sign( {
                        email: foundUser.email,
                        id: foundUser.id,
                        name: foundUser.name
                        }, process.env.ACCESS_TOKEN, {
                        expiresIn: '3h'
                  } )

                  //removal of previous refresh token from the database
                  foundUser.refresh_token = refreshToken 
                  
                  if ( foundUser.isTrading ) {
                        const currentDate = new Date();
                        const isExpired = checkExpiration( currentDate, foundUser.expire_date );
                        if ( isExpired ) {
                              foundUser.isTrading = false
                              foundUser.start_date = null
                              foundUser.expire_date = null
                              foundUser.initial_deposit = null
                        }
                        if ( !isExpired && foundUser.updatedAt.getDate() < currentDate.getDate() ) {
                              const fivepercent = (5/100) * foundUser.initial_deposit
                              foundUser.balance += fivepercent
                        }
                  }
                  
                  await foundUser.save()

                  
                  res.cookie( 'refreshToken', refreshToken, {
                  httpOnly: true,
                  maxAge: 30 * 24 * 60 * 60 * 1000,
                  sameSite:"None",
                  secure: true
                  } )
                  const transactionsinit = await Transaction.find( { user_id: foundUser.id } )
                  const transactions = transactionsinit.map(({_id,_doc,...rest})=>({
                        id:_id,..._doc
                  }))
                  const user = { ...foundUser._doc, accessToken,transactions };
                  delete user.password;
                  delete user.refresh_token

                  return res.status(200).json(user)
            })

      } catch ( e ) {
            console.log(e)
            return res.status(500).json({message:"internal server error", error:e})
      }
};


module.exports={refresh}
