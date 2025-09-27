import { ethers } from "ethers";
import contractABI from '../../contract-abi.json';

/**
 * Type definitions for the Carvest campaign data
 */
export interface Campaign {
  name: string;
  description: string;
  goal: string;
  deadLine: string;
  raisedAmount: string;
  startTime: string;
  isSuccessful: boolean;
  isLocked: boolean;
  isWithdrawn: boolean;
  owner: string;
}

/**
 * CraveService class handles all interactions with the Carvest smart contract
 */
export class CravestService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  /**
   * Creates an instance of CravestService.
   * @param {string} [customProviderUrl] - Optional custom provider URL
   * @param {string} [customPrivateKey] - Optional custom private key
   * @param {string} [customContractAddress] - Optional custom contract address
   */
  constructor(
    customProviderUrl?: string,
    customPrivateKey?: string,
    customContractAddress?: string
  ) {
    this.provider = new ethers.JsonRpcProvider(customProviderUrl || import.meta.env.VITE_ALCHEMY_URL);
    this.signer = new ethers.Wallet(
      customPrivateKey || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
      this.provider
    );
    this.contract = new ethers.Contract(
      customContractAddress || import.meta.env.VITE_CONTRACT_ADDRESS,
      contractABI.abi,
      this.signer
    );
  }

  /**
   * Set a new signer (wallet) for transactions
   * @param {string} privateKey - The private key for the new signer
   */
  setSigner(privateKey: string): void {
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(
      this.contract.target,
      contractABI.abi,
      this.signer
    );
  }

  /**
   * Creates a new crowdfunding campaign
   * @param {string} name - Campaign name
   * @param {string} description - Campaign description
   * @param {number} goal - Fundraising goal in wei
   * @param {number} deadline - Timestamp for campaign end date
   * @returns {Promise<ethers.ContractTransactionResponse>} Transaction response
   */
  async createCampaign(
    name: string,
    description: string,
    goal: number,
    deadline: number
  ): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.createCampaign(name, description, goal, deadline);
  }

  /**
   * Get the total number of campaigns created
   * @returns {Promise<string>} Number of campaigns
   */
  async getCampaignCount(): Promise<string> {
    const count = await this.contract.campaignIdCounter();
    return ethers.formatUnits(count, 0);
  }

  /**
   * Get information about a specific campaign by ID
   * @param {number} campaignId - The ID of the campaign to fetch
   * @returns {Promise<Campaign>} Campaign data
   */
  async getCampaignById(campaignId: number): Promise<Campaign> {
    const {
      name, description, goal, deadLine,
      raisedAmount, startTime, isSuccessful,
      isLocked, isWithdrawn, owner
    } = await this.contract.campaigns(campaignId);

    return {
      name,
      description,
      goal: ethers.formatUnits(goal, 0),
      deadLine: ethers.formatUnits(deadLine, 0),
      raisedAmount: ethers.formatUnits(raisedAmount, 0),
      startTime: ethers.formatUnits(startTime, 0),
      isSuccessful,
      isLocked,
      isWithdrawn,
      owner
    };
  }

  /**
   * Get all campaigns
   * @returns {Promise<Campaign[]>} Array of all campaigns
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    const campaignCount = parseInt(await this.getCampaignCount());
    const campaigns: Campaign[] = [];

    for (let i = 0; i < campaignCount; i++) {
      const campaign = await this.getCampaignById(i);
      campaigns.push(campaign);
    }

    return campaigns;
  }

  /**
   * Contribute ETH to a campaign
   * @param {number} campaignId - The ID of the campaign to contribute to
   * @param {ethers.BigNumberish} amount - Amount to contribute in wei
   * @returns {Promise<ethers.ContractTransactionResponse>} Transaction response
   */
  async contributeToCampaign(
    campaignId: number,
    amount: ethers.BigNumberish
  ): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.contribute(campaignId, { value: amount });
  }

  /**
   * Lock a campaign (can only be done by the owner)
   * @param {number} campaignId - The ID of the campaign to lock
   * @returns {Promise<ethers.ContractTransactionResponse>} Transaction response
   */
  async lockCampaign(campaignId: number): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.lockCampaign(campaignId);
  }

  /**
   * Withdraw funds from a campaign (can only be done by the owner)
   * @param {number} campaignId - The ID of the campaign to withdraw from
   * @returns {Promise<ethers.ContractTransactionResponse>} Transaction response
   */
  async withdraw(campaignId: number): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.withdraw(campaignId);
  }

  /**
   * Request a refund for a contribution (only if campaign failed)
   * @param {number} campaignId - The ID of the campaign to request refund from
   * @returns {Promise<ethers.ContractTransactionResponse>} Transaction response
   */
  async requestRefund(campaignId: number): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.refund(campaignId);
  }

  /**
   * Check if a contributor has been refunded
   * @param {number} campaignId - The campaign ID
   * @param {string} contributorAddress - The contributor's address
   * @returns {Promise<boolean>} Whether the contributor has been refunded
   */
  async isContributorRefunded(
    campaignId: number,
    contributorAddress: string
  ): Promise<boolean> {
    return await this.contract.isContributorRefunded(campaignId, contributorAddress);
  }

  /**
   * Get the amount contributed by a specific address
   * @param {number} campaignId - The campaign ID
   * @param {string} contributorAddress - The contributor's address
   * @returns {Promise<string>} Amount contributed in wei (as string)
   */
  async getContributorAmount(
    campaignId: number,
    contributorAddress: string
  ): Promise<string> {
    const amount = await this.contract.getContributorAmount(campaignId, contributorAddress);
    return ethers.formatUnits(amount, 0);
  }

  /**
   * Get detailed campaign information using the getCampaign function
   * @param {number} campaignId - The ID of the campaign
   * @returns {Promise<any>} Detailed campaign information
   */
  async getCampaignDetails(campaignId: number): Promise<any> {
    const result = await this.contract.getCampaign(campaignId);

    // Parse the returned array into a meaningful object
    return {
      name: result[0],
      description: result[1],
      goal: ethers.formatUnits(result[2], 0),
      deadLine: ethers.formatUnits(result[3], 0),
      raisedAmount: ethers.formatUnits(result[4], 0),
      isSuccessful: result[5],
      isLocked: result[6],
      owner: result[7]
    };
  }
}

// Export a singleton instance with default configuration
const cravestService = new CravestService();
export default cravestService;
