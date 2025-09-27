import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "@/pages/home/Home";
import Header2 from "@/components/mvpblocks/header-2";
import FooterGlow from "@/components/mvpblocks/footer-glow";

export default function App() {
  return (
    <BrowserRouter>
      <Header2 />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <FooterGlow />
    </BrowserRouter>
  )
}
