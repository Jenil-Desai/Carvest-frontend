import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import ModifiedClassicLoader from "@/components/mvpblocks/modified-classic-loader";
import { CampaignCard } from "@/components/global/CampaignCard";
import { CampaignFormDialog } from "@/components/global/CampaignFormDialog";
import { TextReveal } from "@/components/ui/text-reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import cravestService, { type Campaign } from "@/services/carvest";

interface CampaignsProps {
  my?: boolean;
}

export function Campaigns({ my = false }: CampaignsProps) {
  const { address } = useAccount();
  const [campaigns, setCampaigns] = useState<Campaign[] | []>([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await cravestService.getAllCampaigns();

      // If 'my' prop is true, filter campaigns by owner
      const filteredData = my && address
        ? data.filter(campaign => campaign.owner.toLowerCase() === address.toLowerCase())
        : data;

      setCampaigns(filteredData);
    } catch (error) {
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 mt-20">
        <div className="flex justify-between items-center mb-10">
          <TextReveal
            className={cn(
              `bg-primary from-foreground to-primary via-rose-200 bg-clip-text text-4xl md:text-6xl font-bold text-transparent dark:bg-gradient-to-b`
            )}
            from="bottom"
            split="letter"
          >
            {my ? "My Campaigns" : "All Campaigns"}
          </TextReveal>

          <CampaignFormDialog>
            <Button className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </CampaignFormDialog>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center mt-20 h-screen w-full">
          <ModifiedClassicLoader />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {campaigns.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold mb-4">No campaigns found</h3>
              <p className="text-muted-foreground">Be the first to create a campaign!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {campaigns.map((campaign, idx) => (
                <CampaignCard key={idx} id={idx} {...campaign} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
