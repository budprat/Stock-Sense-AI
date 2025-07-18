import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AppLayout from "@/components/layout/app-layout";
import CriticalAlerts from "@/components/dashboard/critical-alerts";
import QuickStats from "@/components/dashboard/quick-stats";
import AIRecommendations from "@/components/dashboard/ai-recommendations";
import InventoryHealth from "@/components/dashboard/inventory-health";
import InventoryHealthScore from "@/components/dashboard/inventory-health-score";
import DemandForecast from "@/components/dashboard/demand-forecast";
import WasteAnalysis from "@/components/dashboard/waste-analysis";
import InventoryTable from "@/components/dashboard/inventory-table";
import SupplierPerformance from "@/components/dashboard/supplier-performance";
import AIAssistant from "@/components/ai/ai-assistant";
import AchievementDashboard from "@/components/achievements/achievement-dashboard";
import CompetitorImport from "@/components/import/competitor-import";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [demoInitialized, setDemoInitialized] = useState(false);
  
  // Initialize demo data on first load only
  useEffect(() => {
    if (demoInitialized) return;
    
    const initDemo = async () => {
      try {
        await apiRequest("POST", "/api/init-demo");
        setDemoInitialized(true);
      } catch (error) {
        console.log("Demo data might already exist");
        setDemoInitialized(true);
      }
    };
    initDemo();
  }, [demoInitialized]);

  return (
    <AppLayout>
      <CriticalAlerts />
      
      <QuickStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <InventoryHealthScore />
        </div>
        <div className="lg:col-span-2" data-tour="ai-recommendations">
          <AIRecommendations />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" data-tour="inventory-health">
          <InventoryHealth />
        </div>
        <div className="lg:col-span-1">
          <AchievementDashboard />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DemandForecast />
        <WasteAnalysis />
      </div>
      
      <div className="mt-6">
        <InventoryTable />
      </div>
      
      <div className="mt-6">
        <SupplierPerformance />
      </div>
      
      <div className="mt-6">
        <CompetitorImport />
      </div>
      
      {/* AI Assistant */}
      <AIAssistant />
    </AppLayout>
  );
}
