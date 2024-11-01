require( "dotenv" ).config();
const express = require( "express" );
const mongoose = require( 'mongoose' );
const cors = require( "cors" );
const cookiePraser = require( "cookie-parser" );
const credentials = require( "./middleware/credentials" );
const corsOption = require( "./config/corsOptions" );
const { verifyJwt } = require( "./middleware/auth" );
const connectDB = require( './config/connectDb' );


const app = express();
const PORT = process.env.PORT || 3500;

// Middlewares

connectDB();
app.use(credentials);
app.use( cors( corsOption ) );
app.options("*", cors(corsOption));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use(express.json({limit:"500mb"}));

app.use( cookiePraser() );

app.get( '/', ( req, res ) =>
{
      res.status(301).redirect(process.env.USER_FRONTEND)
} )

//Admin controller
app.use( '/admin/user', require( "./routes/admin/user" ) );
app.use( '/admin/transaction', require( './routes/admin/transaction' ) );

//user controller
app.use( '/auth', require( "./routes/auth" ) );
app.use('/password',require("./routes/pasword"))
app.use( '/refresh', require( './routes/refresh' ) );

app.use( verifyJwt );
app.use( '/transaction', require( './routes/transaction' ) );



mongoose.connection.once( 'open', () =>
{
      console.log( "Connected to MongoDB" );
      app.listen( PORT, () => console.log( `Server running on ${ PORT }` ) );
})


module.exports = app;
