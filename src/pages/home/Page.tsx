import HeroGeometric from "@/components/mvpblocks/geometric-hero";
import Feature3 from "@/components/mvpblocks/feature-3";
import Faq1 from "@/components/mvpblocks/faq-1";

export function Home() {
  return (
    <>
      <HeroGeometric badge="100% Decentralized" title1="Transparent Crowdfunding" title2="for Everyone" />
      <Feature3 />
      <Faq1 />
    </>
  )
}
