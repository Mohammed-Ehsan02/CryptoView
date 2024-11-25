import express from "express";
import Web3 from "web3";
import fetch from "node-fetch";
import Nft from "../models/Nft.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

if (!ALCHEMY_API_KEY) {
  console.error("Alchemy API key is missing. Add it to your .env file.");
  process.exit(1); // Exit the process if the API key is not configured
}

// Initialize Web3 with the Alchemy endpoint
const web3 = new Web3(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

web3.eth.net.isListening()
  .then(() => console.log("Connected to Ethereum network"))
  .catch((err) => console.error("Failed to connect to Ethereum network:", err));

// Endpoint to fetch NFT metadata
router.post("/metadata", async (req, res) => {
  const { contractAddress, tokenId } = req.body;

  if (!contractAddress || !tokenId) {
    return res.status(400).json({ error: "Missing contractAddress or tokenId" });
  }
  console.log("Fetching metadata for NFT:", contractAddress, tokenId);

  try {
    let nft = await Nft.findOne({ contractAddress, tokenId });
    if (nft) {
      return res.status(200).json(nft);
    }

    const contract = new web3.eth.Contract(
      [
        {
          constant: true,
          inputs: [{ name: "_tokenId", type: "uint256" }],
          name: "tokenURI",
          outputs: [{ name: "", type: "string" }],
          type: "function",
        },
      ],
      contractAddress
    );

    const tokenURI = await contract.methods.tokenURI(tokenId).call();
    console.log("Token URI fetched:", tokenURI);

    let url = tokenURI;
    if (tokenURI.startsWith("ipfs://")) {
      url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const gateways = [
      "https://ipfs.io/ipfs/",
      "https://cloudflare-ipfs.com/ipfs/",
      "https://dweb.link/ipfs/"
    ];

    let metadata;
    for (const gateway of gateways) {
      try {
        const metadataResponse = await fetch(url.replace("https://ipfs.io/ipfs/", gateway), { timeout: 15000 });
        metadata = await metadataResponse.json();
        console.log(`Metadata fetched successfully from gateway: ${gateway}`);
        break;
      } catch (err) {
        console.error(`Error fetching metadata from gateway: ${gateway}`, err.message);
      }
    }

    if (!metadata) {
      throw new Error("Failed to fetch metadata from all gateways.");
    }

    if (metadata.image && metadata.image.startsWith("ipfs://")) {
      metadata.image = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    nft = await Nft.create({ contractAddress, tokenId, metadata });
    res.status(201).json(nft);
  } catch (err) {
    console.error("Error fetching NFT metadata:", err.message);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});


export default router;
