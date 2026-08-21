import { HeaderSection } from './HeaderSection/HeaderSection';
import { StatCardsGrid } from './StatCardsGrid/StatCardsGrid';
import { AnalyticsCharts } from './AnalyticsCharts/AnalyticsCharts';
import { FooterInfoBanner } from './FooterInfoBanner/FooterInfoBanner';
import './Reports.css';

export function Reports() {
  return (
    <div className="dashboard-rpt-page-main-container">
      <HeaderSection />
      <StatCardsGrid />
      <AnalyticsCharts />
      <FooterInfoBanner />
    </div>
  );
};