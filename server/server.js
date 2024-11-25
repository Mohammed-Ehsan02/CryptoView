// Config express
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Routes
// import workoutRoutes from "./routes/workouts.js"; // Commented out for focused testing
// import usersRoutes from "./routes/users.js"; // Commented out for focused testing
// import transactionsRoutes from "./routes/Transactions.js"; // Commented out for focused testing
// import userPortfolio from "./routes/userPortfolio.js"; // Commented out for focused testing
import nftRoutes from "./routes/nft.js"; // NFT Metadata Retrieval
import transactionTrackingRoutes from "./routes/transactionTracking.js"; // Transaction Tracking

dotenv.config();

const app = express();

// Configuration cors
const corsOptions = {
  origin: ["http://localhost:5173", "https://api.coingecko.com/"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware for parsing JSON
app.use(express.json());

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
// app.use("/api/workouts/", workoutRoutes); // Commented out for focused testing
// app.use("/api/portfolio/", userPortfolio); // Commented out for focused testing
// app.use("/api/transactions/", transactionsRoutes); // Commented out for focused testing
// app.use("/api/users/", usersRoutes); // Commented out for focused testing
app.use("/api/nft/", nftRoutes); // NFT Metadata Retrieval API
app.use("/api/transaction-tracking/", transactionTrackingRoutes); // Transaction Tracking API

// Connect to DB and launch server
console.log("Connecting to DB...");
console.log("MONG_URI: ", process.env.MONG_URI);
mongoose
  .connect(process.env.MONG_URI, { useNewUrlParser: true, useUnifiedTopology: true }) // Ensure connection options are included
  .then(() => {
    console.log(`Connected to DB`);
    // Listen for requests
    app.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error.message); // Improved error logging
  });
