const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.bayprof.com",
  port: 465,
  auth: {
    user: "admin@bayprof.com",
    pass: "Rjz=(*RewWYy",
  },
  tls: {
    rejectUnauthorized: false,
  },
} );

const from = `Bayprof Support<admin@bayprof.com>`;

const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return console.log("Email sent");
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { sendMail };
