import express from "express";
import axios from "axios";
import Transaction from "../models/Transaction.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

router.post("/fetch", async (req, res) => {
  const { address } = req.body;

  try {
    // Fetch transactions from Etherscan
    const response = await axios.get(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );

    const transactions = response.data.result.map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timestamp: new Date(tx.timeStamp * 1000),
    }));

    // Save transactions in MongoDB
    let record = await Transaction.findOne({ address });
    if (!record) {
      record = await Transaction.create({ address, transactions });
    } else {
      record.transactions = transactions;
      await record.save();
    }

    res.status(200).json(record);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch transactions", details: err.message });
  }
});

export default router;
