const mongoose = require( "mongoose" );
const Schema = mongoose.Schema;


const Package = ["STARTER","BRONZE","SILVER","GOLD"]

const userSchema = new Schema( {
      email: {
            type: String,
            required: true,
            unique: true
      },
      password: {
            type: String,
            required: true,

      },
      name: {
            type: String,
            required: true
      },
      balance: {
            type: Number,
            default: 0
      },
      initial_deposit: {
            type: Number,
            default: 0
      },
      phone_number: {
            type: String,
            required: true
      },
      isVerified: {
            type: Boolean,
            default: false
      },
      verification_code: String,
      refresh_token: String ,
      isTrading: {
            type: Boolean,
            default: false
      },
      start_date: String,
      expire_date: String,
      package: {
            type: String,
            enum: Package,
            default: "STARTER"
      },
      transactions: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
      }]
}, {
      timestamps: {
            createdAt: "created_at",
            updatedAt: "updatedAt"
      }
} );

module.exports = mongoose.model( 'User', userSchema );