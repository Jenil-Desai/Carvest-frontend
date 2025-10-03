import { Check, DollarSign, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ethers } from "ethers";

import DotCard from "@/components/mvpblocks/dot-card";
import { Progress } from "@/components/ui/progress";
import type { Campaign } from "@/services/carvest";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CampaignCard({ id, ...campaign }: Campaign & { id: number }) {
  const navigate = useNavigate();
  const raised = ethers.formatEther(campaign.raisedAmount);
  const goal = ethers.formatEther(campaign.goal);
  const progressPercentage = Math.min(100, Math.round((Number(raised) / Number(goal)) * 100));

  return (
    <div>
      <DotCard>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{campaign.name}</h2>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/30 text-secondary-foreground">
              Owner: {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
            </div>
          </div>

          <p className="text-muted-foreground">
            {campaign.description}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Raised: <span className="font-medium">${raised}</span></span>
              <span>Goal: <span className="font-medium">${goal}</span></span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              <b>Started:</b>&nbsp;
              {format(new Date(Math.ceil(Number(campaign.startTime) * 1000)), "MMM dd, yyyy")}
            </span>
            <span>
              <b>Deadline:</b>&nbsp;
              {format(new Date(Math.ceil(Number(campaign.deadLine) * 1000)), "MMM dd, yyyy")}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
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

          <Button
            className="w-full"
            size="sm"
            onClick={() => navigate(`/campaigns/${id}`)}
          >
            View Campaign
          </Button>
        </div>
      </DotCard>
    </div>
  )
}
