import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header2 from "@/components/mvpblocks/header-2";
import FooterGlow from "@/components/mvpblocks/footer-glow";

import { Campaigns } from "@/pages/campaigns/Page";
import { CampaignDetail } from "@/pages/campaigns/CampaignDetail";
import { Home } from "@/pages/home/Page";
import { Toaster } from "sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Header2 />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/my" element={<Campaigns my />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
      </Routes>
      <FooterGlow />
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}
