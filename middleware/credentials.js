const allowedOrigin = require( "../config/allowedOrigins" );

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigin.includes(origin)) {
    res.header( "Access-Control-Allow-Credentials", true );
    res.header('Access-Control-Allow-Origin', "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
  }
  next();
};

module.exports = credentials;
