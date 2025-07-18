import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Clock, 
  Thermometer, 
  Droplets, 
  Calendar, 
  TrendingDown, 
  ShieldAlert,
  Eye,
  Settings,
  RefreshCw,
  Plus,
  Sun,
  Bell,
  Calculator,
  Brain,
  Play
} from "lucide-react";
import { 
  useSpoilageRisks, 
  useSpoilagePredictions, 
  useSpoilageStats, 
  useSpoilageAlerts,
  type SpoilageRisk,
  type SpoilagePrediction
} from "@/hooks/use-spoilage-prediction";

export default function SpoilageDashboard() {
  const [selectedRisk, setSelectedRisk] = useState<SpoilageRisk | null>(null);

  const { data: risks, isLoading: risksLoading, refetch: refetchRisks } = useSpoilageRisks();
  const { data: predictions, isLoading: predictionsLoading, refetch: refetchPredictions } = useSpoilagePredictions();
  const spoilageStats = useSpoilageStats();
  const alerts = useSpoilageAlerts();

  // Debug logs
  console.log('SpoilageDashboard - risks:', risks, 'isLoading:', risksLoading);
  console.log('SpoilageDashboard - predictions:', predictions, 'isLoading:', predictionsLoading);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Spoilage Prediction</h2>
          <p className="text-muted-foreground">
            AI-powered spoilage risk analysis and predictions
          </p>
        </div>
        <Button 
          onClick={() => {
            refetchRisks();
            refetchPredictions();
          }}
          disabled={risksLoading || predictionsLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${risksLoading || predictionsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Critical Alerts */}
      {alerts.map((alert, index) => (
        <Alert key={index} className={`${
          alert.type === 'critical' ? 'border-red-200 bg-red-50' :
          alert.type === 'warning' ? 'border-orange-200 bg-orange-50' :
          'border-blue-200 bg-blue-50'
        }`}>
          <AlertTriangle className={`h-4 w-4 ${
            alert.type === 'critical' ? 'text-red-600' :
            alert.type === 'warning' ? 'text-orange-600' :
            'text-blue-600'
          }`} />
          <AlertDescription className={`${
            alert.type === 'critical' ? 'text-red-800' :
            alert.type === 'warning' ? 'text-orange-800' :
            'text-blue-800'
          }`}>
            <strong>{alert.title}:</strong> {alert.message}
          </AlertDescription>
        </Alert>
      ))}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Critical Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{spoilageStats?.criticalItems || 0}</div>
            <p className="text-xs text-muted-foreground">Items needing immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{spoilageStats?.highRiskItems || 0}</div>
            <p className="text-xs text-muted-foreground">Items requiring monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Avg. Days to Expiry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {spoilageStats?.averageDaysToExpiry || 0}
            </div>
            <p className="text-xs text-muted-foreground">Average across all items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-purple-500" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spoilageStats?.averageRiskScore || 0}%</div>
            <p className="text-xs text-muted-foreground">Average risk level</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="storage">Storage Tracking</TabsTrigger>
          <TabsTrigger value="alerts">Critical Alerts</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spoilage Risk Assessment</CardTitle>
                <CardDescription>
                  Items sorted by risk level and urgency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {risksLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing spoilage risks...</p>
                  </div>
                ) : (
                  <>
                    {risks && Array.isArray(risks) && risks.length > 0 && risks.map((risk: SpoilageRisk) => (
                      <div 
                        key={risk.productId}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedRisk?.productId === risk.productId 
                            ? 'border-blue-200 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedRisk(risk)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{risk.productName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getRiskBadgeVariant(risk.spoilageRisk)}>
                                {risk.spoilageRisk.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {risk.daysUntilExpiry} days left
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {Math.round(risk.riskScore * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Risk Score</div>
                          </div>
                        </div>
                        
                        <Progress 
                          value={risk.riskScore * 100} 
                          className="h-2 mb-2"
                        />
                        
                        <p className="text-sm text-muted-foreground">
                          {risk.recommendedAction}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Predicted spoilage: {formatDate(risk.predictedSpoilageDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {(!risks || risks.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        No spoilage risks detected
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Risk Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Factor Analysis</CardTitle>
                <CardDescription>
                  {selectedRisk ? `Detailed analysis for ${selectedRisk.productName}` : 'Select an item to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRisk ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Current Stock</label>
                        <p className="text-lg font-semibold">{selectedRisk.currentStock}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Days Until Expiry</label>
                        <p className="text-lg font-semibold">{selectedRisk.daysUntilExpiry}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Risk Factors</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Temperature Risk</span>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(selectedRisk.factors.temperature * 100)}%
                          </span>
                        </div>
                        <Progress value={selectedRisk.factors.temperature * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Humidity Risk</span>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(selectedRisk.factors.humidity * 100)}%
                          </span>
                        </div>
                        <Progress value={selectedRisk.factors.humidity * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Historical Waste</span>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(selectedRisk.factors.historicalWaste * 100)}%
                          </span>
                        </div>
                        <Progress value={selectedRisk.factors.historicalWaste * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">Storage Conditions</span>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(selectedRisk.factors.storageConditions * 100)}%
                          </span>
                        </div>
                        <Progress value={selectedRisk.factors.storageConditions * 100} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Recommended Action</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedRisk.recommendedAction}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an item from the list to view detailed risk analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Spoilage Predictions</CardTitle>
              <CardDescription>
                Advanced machine learning predictions with confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictionsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Generating AI predictions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions && Array.isArray(predictions) && predictions.length > 0 && predictions.map((prediction: SpoilagePrediction, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">Product ID: {prediction.productId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Predicted spoilage: {prediction.predictedSpoilageDate ? formatDate(prediction.predictedSpoilageDate) : 'Not available'}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {prediction.confidence ? Math.round(prediction.confidence * 100) : 0}% confidence
                        </Badge>
                      </div>

                      {prediction.riskFactors.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium mb-2">Risk Factors</h5>
                          <div className="flex flex-wrap gap-2">
                            {prediction.riskFactors.map((factor, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {prediction.recommendations.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Recommendations</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {prediction.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}

                  {(!predictions || predictions.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No predictions available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tracking Tab */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Storage Conditions Tracking</CardTitle>
              <CardDescription>
                Monitor and record detailed storage conditions for better spoilage prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Current Storage Conditions</h3>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      // TODO: Open storage condition recording modal
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record Conditions
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-blue-500" />
                        Temperature
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.2°C</div>
                      <p className="text-xs text-muted-foreground">Refrigerated storage</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-cyan-500" />
                        Humidity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">65%</div>
                      <p className="text-xs text-muted-foreground">Optimal range</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        Light Exposure
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Low</div>
                      <p className="text-xs text-muted-foreground">Protected from light</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recent Storage Records</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Fresh Tomatoes</p>
                        <p className="text-sm text-muted-foreground">Temperature: 4.1°C, Humidity: 63%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">2 hours ago</p>
                        <p className="text-xs text-muted-foreground">Recorded by System</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Chicken Breast</p>
                        <p className="text-sm text-muted-foreground">Temperature: 3.8°C, Humidity: 68%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">4 hours ago</p>
                        <p className="text-xs text-muted-foreground">Recorded by System</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Critical Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Critical Alerts</CardTitle>
              <CardDescription>
                Automated alerts for critical risk items requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Active Alerts</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">3 Critical</Badge>
                    <Badge variant="secondary">2 High</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-red-800">Critical Temperature Alert</AlertTitle>
                    <AlertDescription className="text-red-700">
                      <div className="flex items-center justify-between">
                        <span>Refrigeration unit #2 temperature risen to 8.5°C - 12 items at risk</span>
                        <Button variant="outline" size="sm" className="ml-4">
                          Resolve
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-red-200 bg-red-50">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-red-800">Critical Expiry Warning</AlertTitle>
                    <AlertDescription className="text-red-700">
                      <div className="flex items-center justify-between">
                        <span>5 items expiring in 24 hours - immediate action required</span>
                        <Button variant="outline" size="sm" className="ml-4">
                          Resolve
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-orange-200 bg-orange-50">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <AlertTitle className="text-orange-800">High Risk Items</AlertTitle>
                    <AlertDescription className="text-orange-700">
                      <div className="flex items-center justify-between">
                        <span>8 items have risk scores above 75% - monitor closely</span>
                        <Button variant="outline" size="sm" className="ml-4">
                          View Details
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Alert History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                      <div>
                        <p className="font-medium text-green-800">Temperature Alert Resolved</p>
                        <p className="text-sm text-green-600">Refrigeration unit #1 temperature normalized</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-700">Resolved 1 hour ago</p>
                        <p className="text-xs text-green-600">by John Doe</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Processing Tab */}
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Processing</CardTitle>
              <CardDescription>
                Process large inventories efficiently with automated batch operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Available Batch Operations</h3>
                  <Button 
                    size="sm"
                    onClick={() => {
                      // TODO: Open batch job creation modal
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Batch Job
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-blue-500" />
                        Risk Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Analyze spoilage risk for all inventory items
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        Process All Items
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        AI Predictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Generate predictions for all products
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        Generate Predictions
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4 text-orange-500" />
                        Alert Generation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Create alerts for critical items
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        Generate Alerts
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recent Batch Jobs</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Risk Analysis - All Items</p>
                          <p className="text-sm text-muted-foreground">
                            Processed 156 items • Completed 2 hours ago
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">Completed</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Duration: 3m 24s</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium">AI Predictions - Perishables</p>
                          <p className="text-sm text-muted-foreground">
                            Processing 89 items • 67% complete
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Running</Badge>
                        <p className="text-xs text-muted-foreground mt-1">ETA: 1m 12s</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div>
                          <p className="font-medium">Alert Generation - Critical Items</p>
                          <p className="text-sm text-muted-foreground">
                            24 items queued • Waiting to start
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Pending</Badge>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}