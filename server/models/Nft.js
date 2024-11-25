import mongoose from "mongoose";

const nftSchema = new mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenId: { type: String, required: true },
  metadata: { type: Object, required: true },
});

const Nft = mongoose.model("Nft", nftSchema);

export default Nft;
