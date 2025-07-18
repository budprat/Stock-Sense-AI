import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Scan, 
  Camera, 
  X, 
  Check, 
  AlertCircle,
  Smartphone,
  Keyboard,
  Zap,
  Package
} from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string, productData?: any) => void;
  trigger?: React.ReactNode;
}

interface ProductData {
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  gtin: string;
  price?: number;
}

export default function BarcodeScanner({ onScan, trigger }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [productData, setProductData] = useState<ProductData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if camera is available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setHasCamera(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
        
        // Start scanning process
        startBarcodeDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access or use manual entry.",
        variant: "destructive",
      });
      setScanMode('manual');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const startBarcodeDetection = () => {
    // Simulate barcode detection since we don't have a real barcode library
    // In a real implementation, you would use a library like @zxing/library or quagga2
    scanIntervalRef.current = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance of "detecting" a barcode
        const mockBarcode = generateMockBarcode();
        handleBarcodeDetected(mockBarcode);
      }
    }, 100);
  };

  const stopBarcodeDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const generateMockBarcode = () => {
    // Generate a mock barcode for demonstration
    const mockBarcodes = [
      "7622210951965", // Toblerone
      "3017620425400", // Nutella
      "0049000028454", // Coca-Cola
      "890103089774", // Maggi
      "0012000161155", // Campbell's Soup
    ];
    return mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
  };

  const handleBarcodeDetected = async (barcode: string) => {
    if (barcode === lastScannedCode) return; // Avoid duplicate scans
    
    setLastScannedCode(barcode);
    stopBarcodeDetection();
    
    // Simulate product lookup
    const mockProductData = await lookupProduct(barcode);
    setProductData(mockProductData);
    
    toast({
      title: "Barcode Scanned! 📱",
      description: `Found: ${mockProductData.name}`,
    });
  };

  const lookupProduct = async (barcode: string): Promise<ProductData> => {
    // Simulate API call to product database
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockProducts: { [key: string]: ProductData } = {
      "7622210951965": {
        name: "Toblerone Dark Chocolate",
        brand: "Toblerone",
        category: "Confectionery",
        description: "Swiss dark chocolate with honey & almond nougat",
        imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=100&h=100&fit=crop",
        gtin: "7622210951965",
        price: 4.99
      },
      "3017620425400": {
        name: "Nutella Hazelnut Spread",
        brand: "Ferrero",
        category: "Spreads",
        description: "Hazelnut spread with cocoa",
        imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=100&h=100&fit=crop",
        gtin: "3017620425400",
        price: 5.49
      },
      "0049000028454": {
        name: "Coca-Cola Classic",
        brand: "Coca-Cola",
        category: "Beverages",
        description: "Original cola soft drink",
        imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=100&h=100&fit=crop",
        gtin: "0049000028454",
        price: 1.99
      }
    };

    return mockProducts[barcode] || {
      name: "Unknown Product",
      brand: "Unknown",
      category: "Unknown",
      description: "Product not found in database",
      imageUrl: "https://images.unsplash.com/photo-1586380951053-5b4e4c28026b?w=100&h=100&fit=crop",
      gtin: barcode,
      price: 0
    };
  };

  const handleManualSubmit = async () => {
    if (!manualBarcode.trim()) {
      toast({
        title: "Enter Barcode",
        description: "Please enter a barcode number.",
        variant: "destructive",
      });
      return;
    }
    
    const mockProductData = await lookupProduct(manualBarcode);
    setProductData(mockProductData);
    
    toast({
      title: "Product Found! 🎯",
      description: `Found: ${mockProductData.name}`,
    });
  };

  const handleConfirmScan = () => {
    if (productData) {
      onScan(productData.gtin, productData);
      setIsOpen(false);
      resetScanner();
    }
  };

  const resetScanner = () => {
    setManualBarcode('');
    setLastScannedCode('');
    setProductData(null);
    stopScanning();
  };

  const stopScanning = () => {
    stopCamera();
    stopBarcodeDetection();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetScanner();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            Scan Barcode
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Scan Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              onClick={() => setScanMode('camera')}
              disabled={!hasCamera}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setScanMode('manual')}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </Button>
          </div>

          {/* Camera Mode */}
          {scanMode === 'camera' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Camera Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-48 bg-gray-100 rounded-lg"
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Camera preview will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!isScanning ? (
                    <Button onClick={startCamera} className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={stopCamera} variant="outline" className="w-full">
                      <X className="h-4 w-4 mr-2" />
                      Stop Camera
                    </Button>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Smartphone className="h-4 w-4" />
                    <span>Position barcode within camera view</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual Mode */}
          {scanMode === 'manual' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Manual Entry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="barcode-input">Barcode Number</Label>
                    <Input
                      id="barcode-input"
                      type="text"
                      placeholder="Enter barcode (e.g., 7622210951965)"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                    />
                  </div>
                  
                  <Button onClick={handleManualSubmit} className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Lookup Product
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    <p>Try these sample barcodes:</p>
                    <div className="mt-2 space-y-1">
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setManualBarcode('7622210951965')}>
                        7622210951965
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer ml-2" onClick={() => setManualBarcode('3017620425400')}>
                        3017620425400
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Result */}
          {productData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={productData.imageUrl}
                    alt={productData.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{productData.name}</h4>
                    <p className="text-sm text-gray-600">{productData.brand}</p>
                    <Badge variant="outline" className="mt-1">
                      {productData.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>GTIN:</span>
                    <span className="font-mono">{productData.gtin}</span>
                  </div>
                  {productData.price && (
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-semibold">${productData.price}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={resetScanner}
                    className="flex-1"
                  >
                    Scan Another
                  </Button>
                  <Button
                    onClick={handleConfirmScan}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}