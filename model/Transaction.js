const mongoose = require( "mongoose" );
const{v4:uuidv4} = require("uuid")
const Schema = mongoose.Schema;


const Status = [  "PENDING","SUCCESS","FAILED"];
const Type = [ "DEPOSIT", "WITHDRAWAL", "TRANSFER" ];

const transactionSchema = new Schema( {
      user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
      },
      amount: {
            type: Number,
            required: true
      },
      status: {
            type: String,
            enum: Status,
            default: "PENDING"
      },
      type: {
            type: String,
            enum: Type,
            required: true
      },
      refrence_number: {
            type: String,
            default: uuidv4,
            unique: true
      }
}, {
      timestamps: {
            createdAt: "created_at"
      }
} );

module.exports = mongoose.model( "Transaction", transactionSchema );