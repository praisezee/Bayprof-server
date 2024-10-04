const { PrismaClient, Prisma } = require( "@prisma/client" );
const { sendErrorResponse, sendSuccessResponse } = require( "../../utils/responseHelper" );
const { sendMail } = require( "../../utils/sendMail" );
const cron = require( "node-cron" )
const {addDays,checkExpiration} = require("../../utils/date")

const prisma = new PrismaClient();

const getUsersTransactions = async ( req, res ) =>
{
      const { user_id } = req.query;
      try {
        if(!user_id){
            const transaction = await prisma.transaction.findMany();
            return sendSuccessResponse( res, 200, "successfull", { transactions:transaction } );
        }
            const transaction = await prisma.transaction.findMany( { where: { user_id } } );
            return sendSuccessResponse( res, 200, "successfull", { transactions:transaction } );
      } catch (error) {
            sendErrorResponse( res, 500, "Internal server error", { error } );
      }
}

const updateTransaction = async ( req, res ) =>
{
      const { id } = req.params;
      const {status,message} = req.body
      if ( !id || !status ) return sendErrorResponse( res, 400, "Transaction id and status is required" );
      try {
            const transaction = await prisma.transaction.update( {
                  where: { id },
                  data: {
                        status: status.toUpperCase(),
                  }
            } )
          const package = transaction.amount < 5000 ? "BRONZE" : transaction.amount>=5000 && transaction.amount < 10000 ? "SILVER" : "GOLD"
            const user = await prisma.user.findUniqueOrThrow( {
                        where: {
                              id: transaction.user_id
                        }
                  } );
            if ( transaction.type === "WITHDRAWAL" && transaction.status === "FAILED" ) {
                  if(!message) return sendErrorResponse(res,400,"Message is required")
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
            <h1>Withdrawal Declined</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${user.name}</strong>,</p>
            <p>We are sorry to inform you that your withdrawal of <strong>${transaction.amount}</strong> was rejected.</p>
            This is as a result of:
            <p>
            ${message}
            </p>
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
                  user.balance += transaction.amount
                  await sendMail( user.email, "Withdrawal failed", html );
            }

            if ( transaction.type === "DEPOSIT" && transaction.status === "SUCCESS" ) {
                  user.initial_deposit = transaction.amount
                  user.isTrading = true
                  user.start_date = new Date().toString()
                  user.expire_date = addDays(4);
                user.balance += transaction.amount
                user.package = package
            }
          if ( transaction.type === "WITHDRAWAL" && transaction.status === "SUCCESS" ) {
              user.balance -= transaction.amount
          }

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
            <p>We wanted to inform you that your ${transaction.type} of <strong>${transaction.amount}</strong> was successfull.</p>
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
            await prisma.user.update({where:{id:transaction.user_id},data:user})

            await sendMail( user.email, "Transaction approved", html );
            return sendSuccessResponse( res, 200, "Successfull", { transaction } );

      }  catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                  return sendErrorResponse(res,404,"Merchant does not exist")
            }
            console.log( e )
            return sendErrorResponse( res, 500, "Internal server error", e );
      }
      finally {
          const transaction = await prisma.transaction.findFirst( { where: { id } } );
          if ( !transaction ) return;
          if ( transaction.type === "DEPOSIT" && transaction.status === "SUCCESS" ) {
              const package = transaction.amount < 5000 ? "BRONZE" : transaction.amount >= 5000 && transaction.amount < 10000 ? "SILVER" : "GOLD"
              const user = await prisma.user.findFirst( { where: { id: transaction.user_id } } );
              const percentageIncre = package === "BRONZE" ? ( 5 / 100 ) * user.initial_deposit : package === "SILVER" ? ( 10.5 * 100 ) / user.initial_deposit : ( 15.5 / 100 ) * user.initial_deposit
              cron.schedule( '0 0 * * *', async () =>
              {
                  try {
                    const current = new Date()
                  const userUpdate = await prisma.user.findFirst( {
                      where: {
                          id: transaction.user_id,
                      }
                  } )
                  const isExpired = checkExpiration( current, userUpdate.expire_date );
                  if ( isExpired ) return;
                  userUpdate.balance += percentageIncre
                  await prisma.user.update( {
                      where: { id: userUpdate.id },
                      data:userUpdate
                  } )
                      console.log("updatad for user");
                  } catch (error) {
                    console.error(error);
                  }
              })
          }
    }
}


module.exports = { getUsersTransactions, updateTransaction };