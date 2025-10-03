import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { RefreshCw, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import cravestService from "@/services/carvest";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  goal: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Goal must be a positive number",
  }),
  deadline: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, {
    message: "Deadline must be in the future",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CampaignFormDialogProps {
  children?: React.ReactNode;
  triggerClassName?: string;
}

export function CampaignFormDialog({
  children,
  triggerClassName
}: CampaignFormDialogProps) {
  const { openConnectModal } = useConnectModal();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      goal: "",
      deadline: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsSubmitting(true);

      try {
        // Ensure we have a fresh signer from the browser wallet
        await cravestService.connectBrowserWallet();
      } catch (walletError) {
        console.error("Failed to connect wallet:", walletError);
        toast.error("Could not connect to your wallet. Please make sure your wallet is unlocked and try again.");
        setIsSubmitting(false);
        return;
      }

      // Convert goal to wei (smallest unit of Ether)
      const goalInWei = ethers.parseEther(data.goal);

      // Convert deadline to Unix timestamp in seconds
      const deadlineTimestamp = Math.floor(new Date(data.deadline).getTime() / 1000);

      try {
        const tx = await cravestService.createCampaign(
          data.name,
          data.description,
          goalInWei,
          deadlineTimestamp
        );

        // Show pending toast
        const pendingToast = toast.loading("Creating campaign...");

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        // Update toast based on receipt status
        if (receipt && receipt.status === 1) {
          toast.success("Campaign created successfully!", { id: pendingToast });
          setOpen(false);
          reset();
          navigate("/campaigns");
        } else {
          toast.error("Transaction failed. Please try again.", { id: pendingToast });
        }
      } catch (txError: any) {
        console.error("Transaction error:", txError);

        // Check for specific error messages and provide user-friendly feedback
        if (txError.message?.includes("insufficient funds")) {
          toast.error("You don't have enough ETH to create this campaign.");
        } else if (txError.message?.includes("user rejected")) {
          toast.error("Transaction was rejected. Please try again.");
        } else if (
          txError.message &&
          (
            txError.message.toLowerCase().includes("may revert") ||
            txError.message.toLowerCase().includes("execution reverted") ||
            txError.message.toLowerCase().includes("revert")
          )
        ) {
          toast.error("Campaign creation would fail. Please check your inputs.");
        } else {
          toast.error("Failed to create campaign: " + (txError.message || "Unknown error"));
        }
      }
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign: " + (error.message || "Please try again"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when dialog is closed
      reset();
    }
    setOpen(newOpen);
  };

  const trigger = children ? (
    children
  ) : (
    <Button className={triggerClassName} variant="outline">
      <Plus className="mr-2 h-4 w-4" />
      Create Campaign
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Create a new crowdfunding campaign. Fill out the details below and submit.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="mb-4 text-center text-muted-foreground">
              Connect your wallet to create a campaign
            </p>
            <Button onClick={() => {
              if (openConnectModal) {
                openConnectModal();
              }
            }}>
              Connect Wallet
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="Enter campaign name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Campaign Description</Label>
              <textarea
                id="description"
                placeholder="Describe your campaign in detail"
                className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Funding Goal (ETH)</Label>
              <Input
                id="goal"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter funding goal in ETH"
                {...register("goal")}
              />
              {errors.goal && (
                <p className="text-sm text-red-500">{errors.goal.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Campaign Deadline</Label>
              <Input
                id="deadline"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register("deadline")}
              />
              {errors.deadline && (
                <p className="text-sm text-red-500">{errors.deadline.message}</p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
