import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import MissionSection from "@/components/home/MissionSection";
import ProgramsPreview from "@/components/home/ProgramsPreview";
import ImpactStats from "@/components/home/ImpactStats";
import CTASection from "@/components/home/CTASection";
import SEOHead from "@/components/shared/SEOHead";
import JsonLd from "@/components/shared/JsonLd";

const Index = () => {
  return (
    <Layout>
      <SEOHead
        title="Raising the Hope of Rural Children Initiative"
        description="From the Village to the World: Bridging Dreams, Unlocking Potentials. RHRCI supports rural children through education, health, and cultural programs in Nigeria."
        path="/"
      />
      <JsonLd />
      <Hero />
      <MissionSection />
      <ProgramsPreview />
      <ImpactStats />
      <CTASection />
    </Layout>
  );
};

export default Index;
