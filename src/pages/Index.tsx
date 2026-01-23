import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import MissionSection from "@/components/home/MissionSection";
import ProgramsPreview from "@/components/home/ProgramsPreview";
import ImpactStats from "@/components/home/ImpactStats";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <MissionSection />
      <ProgramsPreview />
      <ImpactStats />
      <CTASection />
    </Layout>
  );
};

export default Index;
