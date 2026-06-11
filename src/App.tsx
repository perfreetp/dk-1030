import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ProcurementPlan from './pages/ProcurementPlan';
import BiddingHall from './pages/BiddingHall';
import SupplierRegistration from './pages/SupplierRegistration';
import QuotationComparison from './pages/QuotationComparison';
import SampleInspection from './pages/SampleInspection';
import ContractConfirmation from './pages/ContractConfirmation';
import PerformanceTracking from './pages/PerformanceTracking';
import SettlementReview from './pages/SettlementReview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="plan" element={<ProcurementPlan />} />
          <Route path="bidding" element={<BiddingHall />} />
          <Route path="suppliers" element={<SupplierRegistration />} />
          <Route path="quotation" element={<QuotationComparison />} />
          <Route path="sample" element={<SampleInspection />} />
          <Route path="contract" element={<ContractConfirmation />} />
          <Route path="fulfillment" element={<PerformanceTracking />} />
          <Route path="settlement" element={<SettlementReview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
