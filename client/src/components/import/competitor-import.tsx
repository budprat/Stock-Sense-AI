import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, CheckCircle, AlertCircle, Upload, ArrowRight } from "lucide-react";

interface CompetitorPlatform {
  id: string;
  name: string;
  icon: string;
  fileFormat: string;
  importSteps: string[];
}

const competitorPlatforms: CompetitorPlatform[] = [
  {
    id: 'zoho',
    name: 'Zoho Inventory',
    icon: '📊',
    fileFormat: 'CSV',
    importSteps: [
      'Export your data from Zoho Inventory as CSV',
      'Upload the file below',
      'Map your fields to StockSense',
      'Review and confirm import'
    ]
  },
  {
    id: 'sortly',
    name: 'Sortly',
    icon: '📱',
    fileFormat: 'CSV',
    importSteps: [
      'Go to Sortly > Settings > Export',
      'Download your inventory CSV',
      'Upload the file here',
      'We\'ll handle the rest!'
    ]
  },
  {
    id: 'excel',
    name: 'Excel/Google Sheets',
    icon: '📄',
    fileFormat: 'XLSX/CSV',
    importSteps: [
      'Format your spreadsheet with columns: Name, SKU, Quantity, Price',
      'Save as CSV or Excel file',
      'Upload below',
      'Map columns to StockSense fields'
    ]
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    icon: '💼',
    fileFormat: 'IIF/CSV',
    importSteps: [
      'Go to File > Export > Lists to IIF Files',
      'Select Item List',
      'Save and upload the file',
      'We\'ll convert it for you'
    ]
  }
];

export default function CompetitorImport() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStage, setImportStage] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedPlatform) {
      toast({
        title: "Missing Information",
        description: "Please select a platform and upload a file.",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setImportProgress(0);

    // Simulate import stages
    const stages = [
      { stage: 'Validating file format...', progress: 20 },
      { stage: 'Reading inventory data...', progress: 40 },
      { stage: 'Mapping fields...', progress: 60 },
      { stage: 'Importing products...', progress: 80 },
      { stage: 'Finalizing import...', progress: 100 }
    ];

    for (const { stage, progress } of stages) {
      setImportStage(stage);
      setImportProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setImporting(false);
    setIsOpen(false);
    setFile(null);
    setSelectedPlatform('');
    setImportProgress(0);
    setImportStage('');

    toast({
      title: "Import Successful! 🎉",
      description: `Successfully imported ${Math.floor(Math.random() * 100) + 50} products from ${competitorPlatforms.find(p => p.id === selectedPlatform)?.name}`,
    });
  };

  const selectedPlatformData = competitorPlatforms.find(p => p.id === selectedPlatform);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import from Other Platforms
          </span>
          <Badge variant="secondary">One-Click Import</Badge>
        </CardTitle>
        <CardDescription>
          Moving from another inventory system? Import your data in seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {competitorPlatforms.map((platform) => (
            <div
              key={platform.id}
              className="text-center p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              onClick={() => {
                setSelectedPlatform(platform.id);
                setIsOpen(true);
              }}
            >
              <div className="text-2xl mb-1">{platform.icon}</div>
              <p className="text-sm font-medium">{platform.name}</p>
            </div>
          ))}
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Upload className="mr-2 h-4 w-4" />
              Import Your Inventory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import from {selectedPlatformData?.name}</DialogTitle>
              <DialogDescription>
                Follow these simple steps to import your inventory data
              </DialogDescription>
            </DialogHeader>
            
            {!importing ? (
              <div className="space-y-6">
                <div>
                  <Label>Select Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose your current platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitorPlatforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          <span className="flex items-center gap-2">
                            <span>{platform.icon}</span>
                            {platform.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlatformData && (
                  <>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Import Steps:</h4>
                      {selectedPlatformData.importSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                          <p className="text-sm">{step}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="import-file">Upload File ({selectedPlatformData.fileFormat})</Label>
                      <Input
                        id="import-file"
                        type="file"
                        accept=".csv,.xlsx,.xls,.iif"
                        onChange={handleFileChange}
                        className="mt-2"
                      />
                      {file && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <FileSpreadsheet className="h-4 w-4" />
                          {file.name}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={!file || !selectedPlatform}
                      >
                        Start Import
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6 py-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🔄</div>
                  <h3 className="text-lg font-semibold mb-2">Importing Your Inventory</h3>
                  <p className="text-sm text-muted-foreground">{importStage}</p>
                </div>
                
                <div className="space-y-2">
                  <Progress value={importProgress} className="h-3" />
                  <p className="text-center text-sm font-medium">{importProgress}%</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {Math.floor(importProgress * 1.5)}
                    </p>
                    <p className="text-xs text-muted-foreground">Products Imported</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.floor(importProgress * 0.3)}
                    </p>
                    <p className="text-xs text-muted-foreground">Categories Created</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        <div className="mt-4 p-4 bg-accent/50 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Seamless Migration</p>
              <p className="text-xs text-muted-foreground">
                We automatically map fields, detect duplicates, and preserve your data structure
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}