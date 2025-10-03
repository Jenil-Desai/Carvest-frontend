import { BrowserRouter, Route, Routes } from "react-router";

import Header2 from "@/components/mvpblocks/header-2";
import FooterGlow from "@/components/mvpblocks/footer-glow";

import { Campagins } from "@/pages/campagins/Page";
import { Home } from "@/pages/home/Page";

export default function App() {
  return (
    <BrowserRouter>
      <Header2 />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campaigns" element={<Campagins />} />
        <Route path="/campaigns/my" element={<Campagins />} />
      </Routes>
      <FooterGlow />
    </BrowserRouter>
  )
}
