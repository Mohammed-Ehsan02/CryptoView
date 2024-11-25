import mongoose from "mongoose";
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  address: { type: String, required: true },
  transactions: [
    {
      hash: { type: String },
      from: { type: String },
      to: { type: String },
      value: { type: String },
      timestamp: { type: Date },
    },
  ],
});

export default mongoose.model("Transactions", TransactionSchema);
