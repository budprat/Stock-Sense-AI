import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Package, Scan, Camera, Upload } from "lucide-react";
import BarcodeScanner from "@/components/barcode/barcode-scanner";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  costPrice: z.number().min(0, "Cost price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  imageUrl: z.string().optional(),
  isPerishable: z.boolean().default(false),
  shelfLifeDays: z.number().optional(),
  reorderPoint: z.number().min(0, "Reorder point must be positive"),
  maxStock: z.number().min(0, "Max stock must be positive"),
  currentStock: z.number().min(0, "Current stock must be positive"),
  supplier: z.string().optional(),
  location: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function AddProductForm({ onSuccess, trigger }: AddProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'barcode' | 'manual'>('manual');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"]
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      categoryId: "",
      unit: "piece",
      costPrice: 0,
      sellingPrice: 0,
      imageUrl: "",
      isPerishable: false,
      shelfLifeDays: undefined,
      reorderPoint: 10,
      maxStock: 100,
      currentStock: 0,
      supplier: "",
      location: "main",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // First create the product
      const product = await apiRequest("POST", "/api/products", {
        name: data.name,
        description: data.description,
        sku: data.sku,
        categoryId: parseInt(data.categoryId),
        unit: data.unit,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        imageUrl: data.imageUrl,
        isPerishable: data.isPerishable,
        shelfLifeDays: data.shelfLifeDays,
      });

      // Then create the initial inventory entry
      await apiRequest("POST", "/api/inventory", {
        productId: product.id,
        currentStock: data.currentStock,
        reorderPoint: data.reorderPoint,
        maxStock: data.maxStock,
        location: data.location,
      });

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Product Created",
        description: "Product has been successfully added to inventory.",
      });
      form.reset();
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const handleBarcodeScanned = (barcode: string, productData?: any) => {
    if (productData) {
      // Populate form with scanned product data
      form.setValue("name", productData.name || "");
      form.setValue("sku", productData.gtin || barcode);
      form.setValue("description", productData.description || "");
      form.setValue("costPrice", productData.price || 0);
      form.setValue("sellingPrice", productData.price ? productData.price * 1.5 : 0);
      
      // Set category based on product data
      if (productData.category && categories) {
        const matchingCategory = categories.find((cat: any) => 
          cat.name.toLowerCase().includes(productData.category.toLowerCase())
        );
        if (matchingCategory) {
          form.setValue("categoryId", matchingCategory.id.toString());
        }
      }
      
      toast({
        title: "Product Scanned Successfully! 📱",
        description: `${productData.name} has been added to the form.`,
      });
    } else {
      // Just set the barcode as SKU
      form.setValue("sku", barcode);
      toast({
        title: "Barcode Scanned",
        description: "Barcode has been set as SKU. Please fill in other details.",
      });
    }
  };

  const handlePOSSync = async () => {
    // Simulated POS sync - in real app would connect to actual POS system
    try {
      const posData = {
        name: "POS Synced Item",
        sku: "POS-" + Math.random().toString(36).substr(2, 9),
        sellingPrice: 15.99,
        categoryId: categories?.[0]?.id?.toString() || "1",
      };
      
      form.setValue("name", posData.name);
      form.setValue("sku", posData.sku);
      form.setValue("sellingPrice", posData.sellingPrice);
      form.setValue("categoryId", posData.categoryId);
      
      toast({
        title: "POS Sync Complete",
        description: "Product data synchronized from POS system.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync with POS system. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <BarcodeScanner 
              onScan={handleBarcodeScanned}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Barcode
                </Button>
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePOSSync}
              className="flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Sync from POS
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Organic Tomatoes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ORG-TOM-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Optional product description..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="piece">Piece</SelectItem>
                              <SelectItem value="kg">Kilogram</SelectItem>
                              <SelectItem value="lbs">Pounds</SelectItem>
                              <SelectItem value="liter">Liter</SelectItem>
                              <SelectItem value="gallon">Gallon</SelectItem>
                              <SelectItem value="box">Box</SelectItem>
                              <SelectItem value="case">Case</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="costPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {form.watch("costPrice") > 0 && form.watch("sellingPrice") > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Margin:</span>{" "}
                        {(((form.watch("sellingPrice") - form.watch("costPrice")) / form.watch("sellingPrice")) * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Inventory Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="currentStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reorderPoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Point</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Fresh Foods Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="main">Main Storage</SelectItem>
                              <SelectItem value="freezer">Freezer</SelectItem>
                              <SelectItem value="warehouse">Warehouse</SelectItem>
                              <SelectItem value="display">Display Area</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Perishable Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Perishable Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isPerishable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Perishable Item</FormLabel>
                          <FormDescription>
                            Enable tracking for items with expiration dates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("isPerishable") && (
                    <FormField
                      control={form.control}
                      name="shelfLifeDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shelf Life (Days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="7"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            How many days this item stays fresh
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}