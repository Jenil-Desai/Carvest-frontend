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
  private signer: ethers.Signer;
  private contract: ethers.Contract;

  /**
   * Creates an instance of CravestService.
   * @param {string} [customProviderUrl] - Optional custom provider URL
   * @param {ethers.Signer} [customSigner] - Optional custom signer
   * @param {string} [customContractAddress] - Optional custom contract address
   */
  constructor(
    customProviderUrl?: string,
    customSigner?: ethers.Signer,
    customContractAddress?: string
  ) {
    // Initialize with default provider
    this.provider = new ethers.JsonRpcProvider(customProviderUrl || import.meta.env.VITE_ALCHEMY_URL);

    // Use provided signer or create a default one (only for read operations)
    if (customSigner) {
      this.signer = customSigner;
    } else {
      // Default signer is only useful for read operations or development
      this.signer = new ethers.Wallet(
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        this.provider
      );
    }

    // Initialize the contract
    this.contract = new ethers.Contract(
      customContractAddress || import.meta.env.VITE_CONTRACT_ADDRESS,
      contractABI.abi,
      this.signer
    );
  }

  /**
   * Set a new signer (wallet) for transactions
   * @param {ethers.Signer} signer - The signer to use for transactions
   */
  setSigner(signer: ethers.Signer): void {
    this.signer = signer;
    this.contract = new ethers.Contract(
      this.contract.target,
      contractABI.abi,
      this.signer
    );
  }

  /**
   * Get the current network information
   * @returns {Promise<{name: string, chainId: bigint}>} Network information
   */
  async getNetworkInfo(): Promise<{ name: string, chainId: bigint }> {
    const network = await this.provider.getNetwork();
    return {
      name: network.name,
      chainId: network.chainId
    };
  }

  /**
   * Connect to a browser wallet using ethers BrowserProvider
   * This method should be called when using the service with a browser wallet
   * @returns {Promise<void>}
   */
  async connectBrowserWallet(): Promise<void> {
    try {
      // Check if window.ethereum is available
      if (window.ethereum) {
        // Create a browser provider
        const browserProvider = new ethers.BrowserProvider(window.ethereum);

        // Get the signer from the browser provider
        const signer = await browserProvider.getSigner();

        // Update the service with the new signer
        this.setSigner(signer);

        return Promise.resolve();
      } else {
        return Promise.reject(new Error("No Ethereum browser extension detected"));
      }
    } catch (error) {
      console.error("Failed to connect browser wallet:", error);
      return Promise.reject(error);
    }
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
    goal: BigInt,
    deadline: number
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      // Send the transaction with explicit gas configuration
      return await this.contract.createCampaign(
        name,
        description,
        goal,
        deadline
      );
    } catch (error) {
      console.error("Error in createCampaign:", error);

      // Check if this is a gas estimation error
      if (error instanceof Error && error.message.includes("gas")) {
        throw new Error("Transaction would fail: The contract function may revert. Check your inputs.");
      }

      // Check for other common errors
      if (error instanceof Error && error.message.includes("insufficient funds")) {
        throw new Error("Insufficient funds: You don't have enough ETH to complete this transaction.");
      }

      throw error;
    }
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
   * @returns {Promise<(Campaign & { id: number })[]>} Array of all campaigns with their IDs
   */
  async getAllCampaigns(): Promise<(Campaign & { id: number })[]> {
    const campaignCount = parseInt(await this.getCampaignCount());
    const campaigns: (Campaign & { id: number })[] = [];

    for (let i = 0; i < campaignCount; i++) {
      const campaign = await this.getCampaignById(i);
      campaigns.push({ ...campaign, id: i });
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
