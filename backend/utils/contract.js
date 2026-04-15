const { ethers } = require("ethers");
require("dotenv").config();

const contractJSON = require("./EventTicket.json");

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const getReadContract = () => {
  if (!process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS === "DEPLOY_KE_BAAD_AAYEGA") {
    return null;
  }
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractJSON.abi,
    provider
  );
};

const getWriteContract = () => {
  if (!process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS === "DEPLOY_KE_BAAD_AAYEGA") {
    return null;
  }
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractJSON.abi,
    wallet
  );
};

module.exports = { getReadContract, getWriteContract, provider };