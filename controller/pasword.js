const User = require( "../model/User" );
const { sendErrorResponse, sendSuccessResponse } = require( "../utils/responseHelper" );
const jwt = require( "jsonwebtoken" );
const { sendMail } = require( "../utils/sendMail" );
const argon = require("argon2");



const forgetPassword = async (req,res) =>
{
      const { email } = req.query;
      try {
            const foundUser = await User.findOne( { email } ).exec();
            if ( !foundUser ) return sendErrorResponse( res, 404, "User does not exist" );

            const token = jwt.sign(
                  {
                        email,id:foundUser.id,name: foundUser.name
                  },
                  process.env.VERIFY_TOKEN,
                  {
                        expiresIn: "1h"
                  }
            )

            const resetLink = `${process.env.USER_FRONTEND}/reset-password?token=${token}`

            const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Deposit In Progress</title>
            <style>
                  body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 20px;
                  }
                  .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                        background-color: #24838c;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 8px 8px 0 0;
                  }
                  .content {
                        margin: 20px 0;
                  }
                  .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #777;
                  }
            </style>
            </head>
            <body>
            <div class="email-container">
                  <div class="header">
                        <h1>Password Reset Confirmation</h1>
                  </div>
                  <div class="content">
                        <p>Dear <strong>${foundUser.name}</strong>,</p>
                        <p>We are sorry you lost your password, Click the link below to update it</p>
                        <p><a href="${resetLink}">Reset Password</a></p>
                        
                        <p>If you didn't request for this, please feel free to contact our support team at <a href="mailto:${process.env.EMAIL}">${process.env.EMAIL}</a>.</p>
                        <p>Thank you for your patience and for choosing <strong>Bayprof</strong>.</p>
                  </div>
                  <div class="footer">
                        <p>Best regards,</p>
                        <p><strong>Bayprof support</strong><br>
                        Bayprof<br></p>
                  </div>
            </div>
            </body>
            </html>
            `

            foundUser.verification_code = token;
            await foundUser.save()
            await sendMail( email, "Forgot Password", html )
            return sendSuccessResponse(res,200, "Reset mail sent")
      } catch (error) {
            console.error( error );
            return sendErrorResponse(res,500,"Internal server error", {error})
      }
};

const resetPassword = async ( req, res ) =>
{
      const { token, password } = req.body;
      if ( !token || !password ) return sendErrorResponse( res, 400, "Invalid body" );
      try {
            const foundUser = await User.findOne( { verification_code:token } ).exec();
            if ( !foundUser ) return sendErrorResponse( res, 403, "Unauthorized" );
            jwt.verify( token, process.env.VERIFY_TOKEN, async ( err, decoded ) =>
            {
                  if ( err || foundUser.email !== decoded.email ) return res.status( 403 );
                  foundUser.password = await argon.hash( password );
                  foundUser.verification_code = null;
                  await foundUser.save()
                  return sendSuccessResponse( res, 200, "Password reset successfully" );
            } )
            return sendSuccessResponse( res, 200, "Password reset successfully" );
      } catch (error) {
            console.error(error);
      }
};


module.exports = {forgetPassword,resetPassword}