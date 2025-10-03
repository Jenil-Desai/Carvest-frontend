import { Check, DollarSign, LockKeyhole, RefreshCw, Share2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { format } from "date-fns";
import { toast } from "sonner";
import { ethers } from "ethers";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ModifiedClassicLoader from "@/components/mvpblocks/modified-classic-loader";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import cravestService, { type Campaign } from "@/services/carvest";

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userContribution, setUserContribution] = useState("0");
  const [isRefunded, setIsRefunded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/campaigns");
      return;
    }

    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const data = await cravestService.getCampaignById(parseInt(id));
        setCampaign(data);

        if (isConnected && address) {
          const contribution = await cravestService.getContributorAmount(parseInt(id), address);
          setUserContribution(contribution);

          const refunded = await cravestService.isContributorRefunded(parseInt(id), address);
          setIsRefunded(refunded);

          setIsOwner(data.owner.toLowerCase() === address.toLowerCase());
        }
      } catch (error) {
        toast.error("Failed to fetch campaign details");
        navigate("/campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, navigate, address, isConnected]);

  const handleContribute = async () => {
    if (!campaign || !contributionAmount || !isConnected) {
      toast.error("Please connect your wallet and enter a contribution amount");
      return;
    }

    try {
      setIsSubmitting(true);
      const amountInWei = ethers.parseEther(contributionAmount);

      try {
        // Ensure we have a fresh signer from the browser wallet
        await cravestService.connectBrowserWallet();
      } catch (walletError) {
        console.error("Failed to connect wallet:", walletError);
        toast.error("Could not connect to your wallet. Please make sure your wallet is unlocked and try again.");
        setIsSubmitting(false);
        return;
      }

      const tx = await cravestService.contributeToCampaign(parseInt(id!), amountInWei);
      await tx.wait();

      toast.success("Contribution successful!");

      // Refresh campaign details
      const updatedCampaign = await cravestService.getCampaignById(parseInt(id!));
      setCampaign(updatedCampaign);

      if (address) {
        const contribution = await cravestService.getContributorAmount(parseInt(id!), address);
        setUserContribution(contribution);
      }

      setContributionAmount("");
    } catch (error) {
      console.error("Error contributing:", error);
      toast.error("Contribution failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLockCampaign = async () => {
    if (!campaign || !isOwner) return;

    try {
      setIsSubmitting(true);
      const tx = await cravestService.lockCampaign(parseInt(id!));
      await tx.wait();

      toast.success("Campaign locked successfully");

      // Refresh campaign details
      const updatedCampaign = await cravestService.getCampaignById(parseInt(id!));
      setCampaign(updatedCampaign);
    } catch (error) {
      console.error("Error locking campaign:", error);
      toast.error("Failed to lock campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!campaign || !isOwner) return;

    try {
      setIsSubmitting(true);
      const tx = await cravestService.withdraw(parseInt(id!));
      await tx.wait();

      toast.success("Funds withdrawn successfully");

      // Refresh campaign details
      const updatedCampaign = await cravestService.getCampaignById(parseInt(id!));
      setCampaign(updatedCampaign);
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast.error("Failed to withdraw funds");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefund = async () => {
    if (!campaign || isRefunded) return;

    try {
      setIsSubmitting(true);
      const tx = await cravestService.requestRefund(parseInt(id!));
      await tx.wait();

      toast.success("Refund processed successfully");
      setIsRefunded(true);

      // Refresh user contribution amount
      if (address) {
        const contribution = await cravestService.getContributorAmount(parseInt(id!), address);
        setUserContribution(contribution);
      }
    } catch (error) {
      console.error("Error requesting refund:", error);
      toast.error("Failed to process refund");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareCampaign = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Campaign URL copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20 h-screen w-full">
        <ModifiedClassicLoader />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Campaign Not Found</h2>
        <p className="text-muted-foreground mb-8">The campaign you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/campaigns")}>View All Campaigns</Button>
      </div>
    );
  }

  const raised = ethers.formatEther(campaign.raisedAmount);
  const goal = ethers.formatEther(campaign.goal);
  const progressPercentage = Math.min(100, Math.round((Number(raised) / Number(goal)) * 100));
  const deadline = new Date(Number(campaign.deadLine) * 1000);
  const isExpired = deadline < new Date();
  const campaignFailed = isExpired && raised < goal;
  const userHasContributed = Number(userContribution) > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate("/campaigns")}
          className="mb-6"
        >
          ← Back to Campaigns
        </Button>

        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold">{campaign.name}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareCampaign}
            className="flex gap-2 items-center"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mt-2">
          Created by: {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
          {isOwner && <span className="ml-2 text-primary">(You)</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Campaign Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">{campaign.description}</p>
          </div>

          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Funding Status</h2>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Raised: <span className="font-medium">${raised}</span></span>
                <span>Goal: <span className="font-medium">${goal}</span></span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="text-sm text-right text-muted-foreground">
                {progressPercentage}% Complete
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground">Started</div>
                <div className="font-medium">
                  {format(new Date(Number(campaign.startTime) * 1000), "MMM dd, yyyy")}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Deadline</div>
                <div className="font-medium">
                  {format(deadline, "MMM dd, yyyy")}
                  {isExpired && <span className="text-red-500 ml-2">(Expired)</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {campaign.isSuccessful && (
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md",
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                )}>
                  <Check className="w-3 h-3" />
                  Successful
                </div>
              )}

              {campaign.isLocked && (
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md",
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  <LockKeyhole className="w-3 h-3" />
                  Locked
                </div>
              )}

              {campaign.isWithdrawn && (
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md",
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                )}>
                  <DollarSign className="w-3 h-3" />
                  Withdrawn
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isConnected ? (
            <>
              {/* Contribution Section */}
              <div className="p-6 bg-card rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Contribute</h2>

                {campaign.isLocked ? (
                  <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-md">
                    <LockKeyhole className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <p className="text-red-700 dark:text-red-400">This campaign is locked</p>
                  </div>
                ) : isExpired ? (
                  <div className="text-center p-4 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                    <p className="text-amber-700 dark:text-amber-400">
                      This campaign has ended and is no longer accepting contributions
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Amount (ETH)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.01"
                          step="0.01"
                          min="0.01"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleContribute}
                        disabled={isSubmitting || !contributionAmount}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Contribute"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* User Contribution Info */}
              {userHasContributed && (
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Your Contribution</h2>
                  <div className="text-lg font-medium mb-4">
                    {ethers.formatEther(userContribution)} ETH
                  </div>

                  {campaignFailed && !isRefunded && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleRefund}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Request Refund"
                      )}
                    </Button>
                  )}

                  {isRefunded && (
                    <div className="text-center p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                      <p className="text-green-700 dark:text-green-400">
                        Refund processed successfully
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Campaign Owner Section */}
              {isOwner && (
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Campaign Management</h2>

                  <div className="space-y-4">
                    {!campaign.isLocked && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            Lock Campaign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Lock Campaign</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p>Are you sure you want to lock this campaign? This action cannot be undone.</p>
                            <p className="text-muted-foreground mt-2">
                              Locking a campaign prevents further contributions.
                            </p>
                          </div>
                          <div className="flex justify-end gap-4">
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogTrigger>
                            <Button
                              variant="destructive"
                              onClick={handleLockCampaign}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Processing..." : "Lock Campaign"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {campaign.isSuccessful && !campaign.isWithdrawn && (
                      <Button
                        className="w-full"
                        onClick={handleWithdraw}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Withdraw Funds"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 bg-card rounded-lg border shadow-sm text-center">
              <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
              <p className="text-muted-foreground mb-4">
                Connect your wallet to contribute to this campaign or manage it if you're the owner.
              </p>
              <Button className="w-full">Connect Wallet</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
