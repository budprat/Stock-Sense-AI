import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Store, 
  Star, 
  Gift, 
  Share, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Shield,
  DollarSign,
  Mail,
  Award,
  Percent,
  Target,
  AlertCircle
} from "lucide-react";
import OneClickConnector from "@/components/supplier/one-click-connector";

import AppLayout from "@/components/layout/app-layout";

export default function SupplierMarketplace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    review: "",
    orderQuality: 5,
    deliverySpeed: 5,
    customerService: 5,
    valueForMoney: 5,
    wouldRecommend: true,
  });
  const [referralForm, setReferralForm] = useState({
    refereeEmail: "",
  });

  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ["/api/suppliers/marketplace"],
    retry: 1,
  });

  const { data: referrals } = useQuery({
    queryKey: ["/api/referrals"],
    retry: 1,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/referrals/stats"],
    retry: 1,
  });

  // Sample data for demo purposes when API fails
  const sampleSuppliers = [
    {
      id: 1,
      name: "FreshCorp Produce",
      category: "Produce",
      rating: 4.8,
      totalReviews: 245,
      verified: true,
      location: "California, USA",
      specialties: ["Organic", "Local", "Seasonal"],
      description: "Premium organic produce supplier with 15+ years experience",
      discount: 15,
      deliveryTime: "2-3 days",
      minimumOrder: 500,
      contactEmail: "orders@freshcorp.com",
      phone: "(555) 123-4567",
      isActive: true,
    },
    {
      id: 2,
      name: "Ocean Fresh Seafood",
      category: "Seafood",
      rating: 4.9,
      totalReviews: 189,
      verified: true,
      location: "Maine, USA",
      specialties: ["Sustainable", "Wild-caught", "Fresh"],
      description: "Sustainable seafood direct from coastal fishermen",
      discount: 12,
      deliveryTime: "1-2 days",
      minimumOrder: 300,
      contactEmail: "sales@oceanfresh.com",
      phone: "(555) 987-6543",
      isActive: true,
    },
    {
      id: 3,
      name: "Artisan Bakery Supplies",
      category: "Baking",
      rating: 4.7,
      totalReviews: 156,
      verified: true,
      location: "New York, USA",
      specialties: ["Artisan", "Premium", "Organic"],
      description: "High-quality baking ingredients and specialty items",
      discount: 10,
      deliveryTime: "3-4 days",
      minimumOrder: 200,
      contactEmail: "info@artisanbaking.com",
      phone: "(555) 456-7890",
      isActive: true,
    },
  ];

  const displaySuppliers = suppliers || sampleSuppliers;

  const submitReview = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/supplier-reviews", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers/marketplace"] });
    },
  });

  const submitReferral = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/referrals", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Referral Sent",
        description: "Your referral has been sent successfully!",
      });
      setReferralForm({ refereeEmail: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
    },
  });

  const handleReviewSubmit = () => {
    if (!selectedSupplier) return;
    
    submitReview.mutate({
      supplierId: selectedSupplier.id,
      ...reviewForm,
    });
  };

  const handleReferralSubmit = () => {
    submitReferral.mutate(referralForm);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading supplier marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Supplier Marketplace
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover verified suppliers and earn rewards through referrals
        </p>
        {error && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">API unavailable - showing demo data</span>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="referrals">Referral Program</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySuppliers?.map((supplier: any) => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {supplier.verified && (
                        <Shield className="h-4 w-4 text-green-600" />
                      )}
                      {supplier.name}
                    </CardTitle>
                    <Badge variant={supplier.isActive ? "default" : "secondary"}>
                      {supplier.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">{supplier.rating}</span>
                      <span className="text-gray-500">({supplier.totalReviews} reviews)</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {supplier.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4" />
                        Min Order: ${supplier.minimumOrder}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Delivery: {supplier.deliveryTime}
                      </div>
                    </div>
                    
                    {supplier.specialties && (
                      <div className="flex flex-wrap gap-1">
                        {supplier.specialties.slice(0, 3).map((specialty: string) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {supplier.certifications && (
                      <div className="flex flex-wrap gap-1">
                        {supplier.certifications.slice(0, 2).map((cert: string) => (
                          <Badge key={cert} variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        View Details
                      </Button>
                      <OneClickConnector 
                        supplier={supplier} 
                        isConnected={supplier.connected || false}
                        onConnectionChange={(connected) => {
                          // Update supplier connection status
                          supplier.connected = connected;
                        }}
                      />
                    </div>
                    
                    <div className="mt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="w-full">
                            <Star className="mr-2 h-4 w-4" />
                            Write Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Review {supplier.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="rating">Overall Rating</Label>
                              <div className="flex items-center gap-2 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-5 w-5 cursor-pointer ${
                                      star <= reviewForm.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="title">Review Title</Label>
                              <Input
                                id="title"
                                placeholder="Great supplier, fast delivery"
                                value={reviewForm.title}
                                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="review">Review</Label>
                              <Textarea
                                id="review"
                                placeholder="Tell others about your experience..."
                                value={reviewForm.review}
                                onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Order Quality</Label>
                                <div className="flex items-center gap-1 mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 cursor-pointer ${
                                        star <= reviewForm.orderQuality
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                      onClick={() => setReviewForm({ ...reviewForm, orderQuality: star })}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <Label>Delivery Speed</Label>
                                <div className="flex items-center gap-1 mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 cursor-pointer ${
                                        star <= reviewForm.deliverySpeed
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                      onClick={() => setReviewForm({ ...reviewForm, deliverySpeed: star })}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <Button 
                              onClick={handleReviewSubmit}
                              className="w-full"
                              disabled={submitReview.isPending}
                            >
                              {submitReview.isPending ? "Submitting..." : "Submit Review"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalReferrals || 0}</div>
                <div className="text-xs text-gray-600">
                  {userStats?.pendingReferrals || 0} pending
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${userStats?.totalRewards || 0}
                </div>
                <div className="text-xs text-gray-600">
                  ${userStats?.pendingRewards || 0} pending
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {userStats?.conversionRate || 0}%
                </div>
                <div className="text-xs text-gray-600">
                  {userStats?.convertedReferrals || 0} converted
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Referral Program
              </CardTitle>
              <CardDescription>
                Earn $50 for every successful referral. Your friend gets 30% off their first month!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    How it works:
                  </h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>1. Invite your business contacts using their email</li>
                    <li>2. They get 30% off their first month</li>
                    <li>3. You earn $50 when they subscribe</li>
                    <li>4. Both of you benefit from better inventory management!</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="refereeEmail">Friend's Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="refereeEmail"
                      type="email"
                      placeholder="friend@business.com"
                      value={referralForm.refereeEmail}
                      onChange={(e) => setReferralForm({ ...referralForm, refereeEmail: e.target.value })}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleReferralSubmit}
                      disabled={submitReferral.isPending || !referralForm.refereeEmail}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {submitReferral.isPending ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals?.map((referral: any) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{referral.refereeEmail}</div>
                      <div className="text-sm text-gray-600">
                        Sent {new Date(referral.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        referral.status === "converted" ? "default" : 
                        referral.status === "pending" ? "secondary" : "outline"
                      }>
                        {referral.status}
                      </Badge>
                      {referral.status === "converted" && (
                        <div className="text-green-600 font-medium">
                          +${referral.rewardAmount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Reviews</CardTitle>
              <CardDescription>
                Reviews you've written for suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Reviews will be populated from API */}
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No reviews yet. Start reviewing suppliers to help other businesses!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}