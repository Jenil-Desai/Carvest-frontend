import PixelCard from "@/components/global/card/PixelCard";

export interface CampaignCardProps {
  title: string;
  description: string;
  owner: string;
  raised: string | number;
  goal: string | number;
  startDate: string;
  endDate: string;
}

export function CampaignCard({
  title,
  description,
  owner,
  raised,
  goal,
  startDate,
  endDate,
}: CampaignCardProps) {
  return (
    <PixelCard variant="pink">
      <div className="absolute">
        <div className="flex flex-col gap-4 p-6 min-w-[320px]">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-base">{description}</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <span className="block text-xs">Owner</span>
              <span className="font-medium">{owner}</span>
            </div>
            <div>
              <span className="block text-xs">Raised</span>
              <span className="font-medium">{raised}</span>
            </div>
            <div>
              <span className="block text-xs">Goal</span>
              <span className="font-medium">{goal}</span>
            </div>
            <div>
              <span className="block text-xs">Start Date</span>
              <span className="font-medium">{startDate}</span>
            </div>
            <div>
              <span className="block text-xs">End Date</span>
              <span className="font-medium">{endDate}</span>
            </div>
          </div>
        </div>
      </div>
    </PixelCard>
  );
}
