import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronRight } from "lucide-react";

export default function CriticalAlerts() {
  return (
    <div className="mb-6">
      <Alert variant="destructive" className="border-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Critical Stock Alert</h3>
            <p className="text-sm opacity-90">3 items require immediate attention</p>
          </div>
          <Button variant="destructive" size="sm" className="ml-4">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
