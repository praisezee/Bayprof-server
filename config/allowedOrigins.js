const allowedOrigins = [
      "http://localhost:3500",
      "http://localhost:5173",
      "https://bayprof.com",
      "https://api.bayprof.com",
      `${process.env.USER_FRONTEND}`
];

module.exports=allowedOrigins
