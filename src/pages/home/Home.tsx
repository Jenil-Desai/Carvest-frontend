import HeroGeometric from "@/components/mvpblocks/geometric-hero";
import Feature3 from "@/components/mvpblocks/feature-3";
import Faq1 from "@/components/mvpblocks/faq-1";
import { useEffect } from "react";
import { createCampaign, getCampaigns, getCurrentCampaignCountEthers } from "@/lib/interact";
import { Button } from "@/components/ui/button";

export function Home() {
  const handleCreateCampaign = async () => {
    createCampaign().then((res) => {
      console.log("Result : ", res);
      console.log("Campaign created successfully");
    }).catch((error) => {
      console.error("Error creating campaign:", error);
    });
  }

  const handleCount = async () => {
    getCurrentCampaignCountEthers().then((count) => {
      console.log("Current Campaign Count:", count);
    }).catch((error) => {
      console.error("Error fetching campaign count:", error);
    });
  }

  const handleGetAll = async () => {
    getCampaigns().then((campaigns) => {
      console.log("Campaigns:", campaigns);
    }).catch((error) => {
      console.error("Error fetching campaigns:", error);
    });
  }

  return (
    <>
      <HeroGeometric badge="100% Decentralized" title1="Transparent Crowdfunding" title2="for Everyone" />
      <Button onClick={() => handleCreateCampaign()}>Create Campaign</Button>
      <Button onClick={() => handleCount()}>View Count</Button>
      <Button onClick={() => handleGetAll()}>Get All Campaigns</Button>
      <Feature3 />
      <Faq1 />
    </>
  )
}
