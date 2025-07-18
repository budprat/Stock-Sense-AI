import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Brain, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Package,
  Sparkles,
  MessageSquare,
  Send,
  RefreshCw,
  FileText,
  Target,
  Lightbulb
} from "lucide-react";

interface AIRecommendation {
  id: string;
  type: 'reorder' | 'waste_alert' | 'optimization' | 'seasonal' | 'supplier';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  impact: string;
  confidence: number;
  category: string;
  productId?: number;
  supplierId?: number;
  quantityRecommended?: number;
  costSavings?: number;
  timestamp: Date;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: AIRecommendation[];
}

export default function AIAssistant() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  // Fetch AI recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/ai/recommendations"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch AI inventory report
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["/api/ai/report"],
    enabled: isExpanded,
  });

  // Generate AI recommendations mutation
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      return await apiRequest("GET", "/api/ai/recommendations");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/recommendations"] });
      toast({
        title: "AI Recommendations Updated",
        description: `Generated ${data.length} new recommendations`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive",
      });
    },
  });

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          type: "assistant",
          content: "Hello! I'm your AI Inventory Assistant. I can help you with proactive recommendations, inventory analysis, and optimization strategies. What would you like to know about your inventory?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length]);

  // Auto-generate recommendations when component mounts
  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      const recommendationMessage: Message = {
        id: `recommendations-${Date.now()}`,
        type: "assistant",
        content: "I've analyzed your inventory and generated some proactive recommendations for you:",
        timestamp: new Date(),
        recommendations: recommendations,
      };
      
      setMessages(prev => {
        const hasRecommendations = prev.some(msg => msg.recommendations);
        if (!hasRecommendations) {
          return [...prev, recommendationMessage];
        }
        return prev;
      });
    }
  }, [recommendations]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Simulate AI response (in production, this would call a chat API)
      setTimeout(() => {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "assistant",
          content: generateAIResponse(inputMessage),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("inventory") || input.includes("stock")) {
      return "Based on your current inventory levels, I recommend focusing on your low-stock items. Your tomatoes are approaching the reorder point, and olive oil inventory is running low. Would you like me to generate specific reorder recommendations?";
    }
    
    if (input.includes("reorder") || input.includes("order")) {
      return "I can help optimize your reorder quantities. Based on historical data and demand patterns, I recommend ordering 50 lbs of tomatoes and 24 bottles of olive oil. This will maintain optimal stock levels while minimizing carrying costs.";
    }
    
    if (input.includes("waste") || input.includes("spoil")) {
      return "To reduce waste, I suggest implementing FIFO rotation for your perishables. Your current waste rate is 8%, which is below the industry average of 12%. Focus on items with shorter shelf lives and consider dynamic pricing for items approaching expiration.";
    }
    
    if (input.includes("profit") || input.includes("cost")) {
      return "Your inventory turnover ratio is 4.2, which is healthy. To improve profitability, consider optimizing your product mix. High-margin items like specialty oils have good demand patterns and low spoilage rates.";
    }
    
    return "I understand you're looking for inventory insights. Let me analyze your data and provide specific recommendations. Would you like me to focus on reorder optimization, waste reduction, or profitability analysis?";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reorder': return <Package className="h-4 w-4" />;
      case 'waste_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'seasonal': return <TrendingUp className="h-4 w-4" />;
      case 'supplier': return <Lightbulb className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 left-24 z-50"
      >
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bot className="h-6 w-6 text-white" />
          </motion.div>
        </Button>
        
        {/* Notification badges */}
        <AnimatePresence>
          {recommendations && recommendations.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
            >
              {recommendations.length}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 left-24 z-50 w-96 max-w-[90vw]"
    >
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Assistant</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateRecommendations.mutate()}
                disabled={generateRecommendations.isPending}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${generateRecommendations.isPending ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-white hover:bg-white/20"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-96 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Recommendations */}
                      {message.recommendations && (
                        <div className="mt-3 space-y-2">
                          {message.recommendations.map((rec) => (
                            <motion.div
                              key={rec.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 }}
                              className="bg-white rounded-lg p-3 shadow-sm border"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                                  {getTypeIcon(rec.type)}
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${getPriorityColor(rec.priority)} text-white`}
                                  >
                                    {rec.priority}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Zap className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs text-gray-500">{rec.confidence}%</span>
                                </div>
                              </div>
                              
                              <h4 className="font-medium text-sm mt-2 text-gray-900">{rec.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                              
                              <div className="mt-2 text-xs text-gray-500">
                                <span className="font-medium">Action:</span> {rec.action}
                              </div>
                              
                              {rec.costSavings && (
                                <div className="mt-1 flex items-center text-green-600 text-xs">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  <span>Potential savings: ${rec.costSavings}</span>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <Separator />

            {/* Input area */}
            <div className="p-4">
              <div className="flex space-x-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me about your inventory..."
                  className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}