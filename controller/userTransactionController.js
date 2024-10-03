const { PrismaClient, Prisma } = require( "@prisma/client" );
const { sendErrorResponse, sendSuccessResponse } = require( "../utils/responseHelper" );
const {sendDepositMail,sendWithdrawalMail} = require( "./mailcontroller" );
const { sendMail } = require( "../utils/sendMail" );

const prisma = new PrismaClient();

const getTransaction = async ( req, res ) =>
{
      try {
            const transaction = await prisma.transaction.findMany( { where: { user_id: res.user.id } } )
            return sendSuccessResponse(res,200, "successfull",{transaction})
      } catch (error) {
            sendErrorResponse( res, 500, "Internal server error", { error } );
      }
};

const depositTransaction = async ( req, res ) =>
{
      try {
            const { amount,hash,chain,token } = req.body;
            if(!amount) return sendErrorResponse(res,400,"Amount is needed")
            const user = await prisma.user.findUniqueOrThrow( {
                  where: {
                        id: res.user.id
                  }
            } );

            const transaction = await prisma.transaction.create( {
                  data: {
                        user_id: res.user.id,
                        amount: parseFloat( amount ),
                        type: "DEPOSIT"
                  }
            } );

            await sendDepositMail( transaction, hash,chain,token )
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
            <h1>Deposit In Progress</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${user.name}</strong>,</p>
            <p>We wanted to inform you that your deposit of <strong>${amount}</strong> is currently being processed.</p>
            <p>Here are the details of your transaction:</p>
            <ul>
                <li><strong>Deposit Amount:</strong> ${transaction.amount}</li>
                <li><strong>Transaction Date:</strong> ${transaction.created_at}</li>
                <li><strong>Transaction Reference:</strong> ${transaction.refrence_number}</li>
            </ul>
            <p>Once the process is complete, you will receive a confirmation email. If you have any questions or concerns in the meantime, please feel free to contact our support team at <a href="mailto:${process.env.EMAIL}">${process.env.EMAIL}</a>.</p>
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
            await sendMail( user.email, "Deposit in progress", html )
            
            return sendSuccessResponse( res, 201, "Transaction in progress", { transaction } );

      } catch ( error ) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                  if (error.code === "P2025")
                  return sendErrorResponse(res,404,"User does not exist")
            }
            sendErrorResponse( res, 500, "Internal server error", { error } );
      }
};

const withdraw = async ( req, res ) =>
{
      const { amount,address, chain,token} = req.body;
      if(!amount) return sendErrorResponse(res,400,"Amount is needed")
      try {
            const user = await prisma.user.findUniqueOrThrow( {
                  where: {
                        id: res.user.id
                  }
            } );
          if(parseFloat(amount) > user.balance) return sendErrorResponse(res,400,"Insuficient Balance")
            const transaction = await prisma.transaction.create( {
                  data: {
                        user_id: user.id,
                        amount: parseFloat( amount ),
                        type: "WITHDRAWAL"
                  }
            } )
            
            await prisma.user.update( {
                  where: {
                        id:res.user.id
                  },
                  data: {
                        balance: user.balance - parseFloat( amount )
                  }
            } )
            
            await sendWithdrawalMail( transaction,address,chain,token );

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
            <h1>Deposit In Progress</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${user.name}</strong>,</p>
            <p>We wanted to inform you that your withdrawal of <strong>${amount}</strong> is currently being processed.</p>
            <p>Here are the details of your transaction:</p>
            <ul>
                <li><strong>Withdrawal Amount:</strong> ${transaction.amount}</li>
                <li><strong>Transaction Date:</strong> ${transaction.created_at}</li>
                <li><strong>Transaction Reference:</strong> ${transaction.refrence_number}</li>
                <li><strong>Recipient Address Network:</strong> ${chain}</li>
                <li><strong>Recipient Preferred Token:</strong> ${token}</li>
                <li><strong>Recipient Address:</strong> ${address}</li>
            </ul>
            <p>Once the process is complete, you will receive a confirmation email. If you have any questions or concerns in the meantime, please feel free to contact our support team at <a href="mailto:${process.env.EMAIL}">${process.env.EMAIL}</a>.</p>
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
            await sendMail( user.email, "Deposit in progress", html )
            
            return sendSuccessResponse( res, 201, "Transaction in progress", { transaction } );

      } catch ( error ) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                  if (error.code === "P2025")
                  return sendErrorResponse(res,404,"User does not exist")
            }
            sendErrorResponse( res, 500, "Internal server error", { error } );
      }
};

module.exports = {getTransaction,depositTransaction,withdraw}