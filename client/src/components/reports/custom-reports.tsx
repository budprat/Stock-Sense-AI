import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Download, 
  Share2, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Eye,
  Settings,
  Save,
  Play,
  Pause,
  Mail,
  Printer,
  ExternalLink
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'inventory' | 'sales' | 'waste' | 'performance' | 'custom';
  fields: string[];
  filters: any;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  visualization: 'table' | 'chart' | 'dashboard';
  createdAt: Date;
  lastRun?: Date;
  isActive: boolean;
}

interface ReportData {
  headers: string[];
  rows: any[][];
  summary: {
    totalRecords: number;
    totalValue: number;
    averageValue: number;
    trends: {
      label: string;
      value: number;
      change: number;
    }[];
  };
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'inventory-status',
    name: 'Inventory Status Report',
    description: 'Current stock levels and reorder recommendations',
    type: 'inventory',
    fields: ['product', 'current_stock', 'reorder_point', 'status', 'value'],
    filters: { category: 'all', location: 'all' },
    visualization: 'table',
    createdAt: new Date(),
    isActive: true
  },
  {
    id: 'waste-analysis',
    name: 'Waste Analysis Report',
    description: 'Detailed breakdown of inventory waste and cost impact',
    type: 'waste',
    fields: ['product', 'waste_quantity', 'waste_reason', 'cost_impact', 'date'],
    filters: { period: '30d' },
    visualization: 'chart',
    createdAt: new Date(),
    isActive: true
  },
  {
    id: 'supplier-performance',
    name: 'Supplier Performance Report',
    description: 'Supplier delivery times, quality, and reliability metrics',
    type: 'performance',
    fields: ['supplier', 'orders_count', 'avg_delivery_time', 'quality_score', 'reliability'],
    filters: { period: '90d' },
    visualization: 'dashboard',
    createdAt: new Date(),
    isActive: true
  }
];

export default function CustomReports() {
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const { toast } = useToast();

  const [newReport, setNewReport] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    type: 'inventory',
    fields: [],
    filters: {},
    visualization: 'table',
    schedule: {
      enabled: false,
      frequency: 'weekly',
      recipients: []
    }
  });

  const generateReport = useMutation({
    mutationFn: async (templateId: string): Promise<ReportData> => {
      // Mock data for demonstration
      return {
        headers: ['Product', 'Current Stock', 'Reorder Point', 'Status', 'Value'],
        rows: [
          ['Fresh Tomatoes', '45 lbs', '20 lbs', 'Healthy', '$157.50'],
          ['Olive Oil', '8 bottles', '15 bottles', 'Low Stock', '$96.00'],
          ['Organic Chicken', '0 lbs', '10 lbs', 'Out of Stock', '$0.00']
        ],
        summary: {
          totalRecords: 3,
          totalValue: 253.50,
          averageValue: 84.50,
          trends: [
            { label: 'Healthy Items', value: 1, change: 0 },
            { label: 'Low Stock', value: 1, change: 1 },
            { label: 'Out of Stock', value: 1, change: 1 }
          ]
        }
      };
    },
    onSuccess: (data) => {
      setReportData(data);
      toast({
        title: "Report Generated",
        description: "Your custom report has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const exportReport = useMutation({
    mutationFn: async (format: 'pdf' | 'excel' | 'csv') => {
      // Mock export functionality
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`report-${Date.now()}.${format}`);
        }, 1000);
      });
    },
    onSuccess: (filename) => {
      toast({
        title: "Export Complete",
        description: `Report exported as ${filename}`,
      });
    }
  });

  const saveReport = useMutation({
    mutationFn: async (report: Partial<ReportTemplate>) => {
      // Mock save functionality
      return { ...report, id: Date.now().toString() };
    },
    onSuccess: () => {
      toast({
        title: "Report Saved",
        description: "Your custom report template has been saved.",
      });
      setIsCreating(false);
      setNewReport({
        name: '',
        description: '',
        type: 'inventory',
        fields: [],
        filters: {},
        visualization: 'table'
      });
    }
  });

  const scheduleReport = useMutation({
    mutationFn: async (templateId: string, schedule: any) => {
      // Mock schedule functionality
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Schedule Updated",
        description: "Report schedule has been configured.",
      });
    }
  });

  const handleFieldToggle = (field: string) => {
    const fields = newReport.fields || [];
    if (fields.includes(field)) {
      setNewReport({
        ...newReport,
        fields: fields.filter(f => f !== field)
      });
    } else {
      setNewReport({
        ...newReport,
        fields: [...fields, field]
      });
    }
  };

  const availableFields = {
    inventory: [
      'product', 'current_stock', 'reorder_point', 'max_stock', 'status', 
      'value', 'location', 'category', 'supplier', 'last_updated'
    ],
    sales: [
      'product', 'quantity_sold', 'revenue', 'profit', 'date', 'location',
      'customer', 'payment_method', 'discount'
    ],
    waste: [
      'product', 'waste_quantity', 'waste_reason', 'cost_impact', 'date',
      'location', 'category', 'prevention_action'
    ],
    performance: [
      'supplier', 'orders_count', 'avg_delivery_time', 'quality_score',
      'reliability', 'cost_efficiency', 'communication_rating'
    ]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Reports</h1>
          <p className="text-muted-foreground">Create, schedule, and export custom reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="generated">Generated</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Fields:</span>
                        <span className="font-medium">{template.fields.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Visualization:</span>
                        <Badge variant="secondary">{template.visualization}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant={template.isActive ? "default" : "destructive"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateReport.mutate(template.id)}
                          disabled={generateReport.isPending}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {REPORT_TEMPLATES.filter(t => t.schedule?.enabled).map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Runs {template.schedule?.frequency} • Last run: {template.lastRun?.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          {reportData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Report</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport.mutate('pdf')}
                      disabled={exportReport.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport.mutate('excel')}
                      disabled={exportReport.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport.mutate('csv')}
                      disabled={exportReport.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600">Total Records</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {reportData.summary.totalRecords}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600">Total Value</div>
                      <div className="text-2xl font-bold text-green-700">
                        ${reportData.summary.totalValue.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-sm text-yellow-600">Average Value</div>
                      <div className="text-2xl font-bold text-yellow-700">
                        ${reportData.summary.averageValue.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-600">Trends</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {reportData.summary.trends.length}
                      </div>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {reportData.headers.map((header, index) => (
                            <th key={index} className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-3 text-sm">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-generate daily reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate key reports every day
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications when reports are ready
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data retention</Label>
                    <p className="text-sm text-muted-foreground">
                      Keep generated reports for 90 days
                    </p>
                  </div>
                  <Select defaultValue="90d">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="1y">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Report Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Custom Report</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Report Name</Label>
                <Input
                  id="name"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  placeholder="Enter report name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="Describe what this report contains"
                />
              </div>

              <div>
                <Label>Report Type</Label>
                <Select
                  value={newReport.type}
                  onValueChange={(value: any) => setNewReport({ ...newReport, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="waste">Waste</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fields to Include</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableFields[newReport.type as keyof typeof availableFields]?.map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={newReport.fields?.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <Label htmlFor={field} className="text-sm">
                        {field.replace('_', ' ').toUpperCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Visualization</Label>
                <Select
                  value={newReport.visualization}
                  onValueChange={(value: any) => setNewReport({ ...newReport, visualization: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => saveReport.mutate(newReport)}
                  disabled={saveReport.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Report
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}