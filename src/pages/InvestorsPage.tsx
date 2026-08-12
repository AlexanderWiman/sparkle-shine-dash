import SEOHead from "@/components/SEOHead";
import InvestorHeader from "@/components/investors/InvestorHeader";
import InvestorHero from "@/components/investors/InvestorHero";
import ImpactCounters from "@/components/investors/ImpactCounters";
import ProblemSolution from "@/components/investors/ProblemSolution";
import OurSolution from "@/components/investors/OurSolution";
import MarketOpportunity from "@/components/investors/MarketOpportunity";
import Traction from "@/components/investors/Traction";
import SustainabilityDeepDive from "@/components/investors/SustainabilityDeepDive";
import VisionSection from "@/components/investors/VisionSection";
import InvestorCTA from "@/components/investors/InvestorCTA";
import InvestorFooter from "@/components/investors/InvestorFooter";

const InvestorsPage = () => {
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <SEOHead
        title="Car Washap – Investor Relations | 95% Less Water Car Wash"
        description="Sustainable car wash technology using only 5–10 liters of water per wash vs. 150+ liters industry standard. Learn about our US expansion opportunity."
        canonicalPath="/investors"
        keywords="sustainable car wash, water saving car wash, eco car wash investment, green car wash technology, US car wash market"
      />
      <InvestorHeader />
      <main>
        <InvestorHero />
        <ImpactCounters />
        <ProblemSolution />
        <OurSolution />
        <MarketOpportunity />
        <Traction />
        <SustainabilityDeepDive />
        <VisionSection />
        <InvestorCTA />
      </main>
      <InvestorFooter />
    </div>
  );
};

export default InvestorsPage;
