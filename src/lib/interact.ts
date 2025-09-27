import contractABI from '../../contract-abi.json';
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_URL);
const signer = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, contractABI.abi, signer);

export async function createCampaign() {
  return await contract.createCampaign("First Campaign", "Lofee Keyboard crowdfunding", 10000, Math.floor(new Date('2025-12-31T23:59:59Z').getTime() / 1000));
}

export async function getCurrentCampaignCountEthers() {
  const count = await contract.campaignIdCounter();
  return ethers.formatUnits(count, 0);
}

export async function getCampaigns() {
  const { name, description, goal, deadLine, raisedAmount, startTime, isSuccessful, isLocked, isWithdrawn, owner } = await contract.campaigns(0);
  return {
    "name": name,
    "description": description,
    "goal": ethers.formatUnits(goal, 0),
    "deadLine": ethers.formatUnits(deadLine, 0),
    "raisedAmount": ethers.formatUnits(raisedAmount, 0),
    "startTime": ethers.formatUnits(startTime, 0),
    "isSuccessful": isSuccessful,
    "isLocked": isLocked,
    "isWithdrawn": isWithdrawn,
    "owner": owner
  };
}
