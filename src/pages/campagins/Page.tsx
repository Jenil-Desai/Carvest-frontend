import { CampaignCard } from "@/components/global/CampaignCard";
import ModifiedClassicLoader from "@/components/mvpblocks/modified-classic-loader";
import { TextReveal } from "@/components/ui/text-reveal";
import { cn } from "@/lib/utils";
import cravestService, { type Campaign } from "@/services/carvest";
import { useState } from "react";
import { toast } from "sonner";

export function Campagins() {
  const [campaigns, setCampaigns] = useState<Campaign[] | []>([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await cravestService.getAllCampaigns();
      setCampaigns(data);
    } catch (error) {
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchCampaigns();
  });

  return (
    <>
      <div className="flex w-full justify-center items-center">
        <TextReveal
          className={cn(
            `bg-primary from-foreground to-primary via-rose-200 bg-clip-text text-6xl font-bold text-transparent dark:bg-gradient-to-b mt-20`
          )}
          from="bottom"
          split="letter"
        >
          Campagins
        </TextReveal>
      </div>
      {loading ? (
        <div className="flex justify-center items-center mt-20 h-screen w-full">
          <ModifiedClassicLoader />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mt-10 h-screen w-full">
          {campaigns.map((campaign, idx) => (
            <CampaignCard key={idx} {...campaign} />
          ))}
        </div>
      )}
    </>
  );
}
