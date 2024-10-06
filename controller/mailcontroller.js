const { sendMail } = require( "../utils/sendMail" );

const to = [process.env.WORKING_MAIL]

const sendDepositMail = async ( transaction,hash,chain,token  ) =>
{
      const html = `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deposit Confirmation</title>
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
            <h1>Deposit Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear <strong>Admin</strong>,</p>
            <p>We are pleased to inform you that your deposit of <strong>${transaction.amount}</strong> has been successfully received.</p>
            <p>Here are the details of your transaction:</p>
            <ul>
                <li><strong>Deposit Amount:</strong> ${transaction.amount}</li>
                <li><strong>Transaction Date:</strong> ${new Date()}</li>
                <li><strong>Transaction Reference:</strong> ${transaction.refrence_number}</li>
                <li><strong>Network:</strong> ${chain}</li>
                <li><strong>Token:</strong> ${token}</li>
                <li><strong>Transaction hash:</strong> ${hash}</li>
            </ul>
        </div>
        <div class="footer">
            <p>Best regards,</p>
            <p><strong>Micheal</strong><br>
               customer Support<br>
              Bayprof<br></p>
        </div>
    </div>
</body>
</html>
            `
      await sendMail(to,"Deposit Confirmation",html)
};

const sendWithdrawalMail = async ( transaction,address,chain,token  ) =>
{
      const html = `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deposit Confirmation</title>
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
            <h1>Deposit Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear <strong>Admin</strong>,</p>
            <p>We are pleased to inform you that a withdrawal of <strong>${transaction.amount}</strong> has been successfully placed.</p>
            <p>Here are the details of your transaction:</p>
            <ul>
                <li><strong>Withdrawal Amount:</strong> ${transaction.amount}</li>
                <li><strong>Transaction Date:</strong> ${new Date()}</li>
                <li><strong>Transaction Reference:</strong> ${transaction.refrence_number}</li>
                <li><strong>Recipient Address Network:</strong> ${chain}</li>
                <li><strong>Recipient Preferred Token:</strong> ${token}</li>
                <li><strong>Recipient Address:</strong> ${address}</li>
            </ul>
        </div>
        <div class="footer">
            <p>Best regards,</p>
            <p><strong>Micheal</strong><br>
               customer Support<br>
              Bayprof<br></p>
        </div>
    </div>
</body>
</html>
            `

      await sendMail(to,"Deposit Confirmation",html)
};

module.exports = {sendDepositMail,sendWithdrawalMail}