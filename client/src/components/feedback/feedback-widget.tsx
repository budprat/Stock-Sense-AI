import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Bug, 
  Lightbulb, 
  Heart,
  Send,
  X,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FeedbackData {
  type: 'positive' | 'negative' | 'bug' | 'suggestion';
  message: string;
  page: string;
  rating?: number;
}

const feedbackTypes = [
  {
    type: 'positive' as const,
    icon: ThumbsUp,
    label: 'Positive Feedback',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    description: 'Share what you love about StockSense'
  },
  {
    type: 'negative' as const,
    icon: ThumbsDown,
    label: 'Improvement Needed',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    description: 'Let us know what could be better'
  },
  {
    type: 'bug' as const,
    icon: Bug,
    label: 'Report Bug',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    description: 'Found something that isn\'t working right?'
  },
  {
    type: 'suggestion' as const,
    icon: Lightbulb,
    label: 'Feature Request',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    description: 'Suggest new features or improvements'
  }
];

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackData['type'] | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackData) => {
      return await apiRequest('/api/feedback', 'POST', data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve StockSense.",
      });
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setSelectedType(null);
        setMessage('');
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Error submitting feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!selectedType || !message.trim()) return;

    feedbackMutation.mutate({
      type: selectedType,
      message: message.trim(),
      page: window.location.pathname
    });
  };

  const handleQuickFeedback = (type: FeedbackData['type']) => {
    const quickMessages = {
      positive: "Great experience with StockSense!",
      negative: "Could use some improvements",
      bug: "I found a bug that needs fixing",
      suggestion: "I have a feature suggestion"
    };

    feedbackMutation.mutate({
      type,
      message: quickMessages[type],
      page: window.location.pathname
    });
  };

  const handleReset = () => {
    setSelectedType(null);
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <div className="fixed bottom-4 right-24 z-40">
      {/* Feedback Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      )}

      {/* Feedback Panel */}
      {isOpen && (
        <Card className="w-80 shadow-xl border-0 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Quick Feedback
                </CardTitle>
                <CardDescription className="text-xs">
                  Help us improve StockSense
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {!selectedType && !isSubmitted && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground mb-3">
                  Choose feedback type:
                </div>
                
                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.type}
                        variant="outline"
                        onClick={() => setSelectedType(type.type)}
                        className={cn(
                          "h-auto p-3 flex flex-col items-center gap-1 text-xs",
                          type.bgColor,
                          "border-dashed"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", type.color)} />
                        <span className="font-medium">{type.label}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* One-Click Feedback */}
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-2">
                    One-click feedback:
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickFeedback('positive')}
                      disabled={feedbackMutation.isPending}
                      className="flex-1 bg-green-50 hover:bg-green-100 border-green-200"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1 text-green-600" />
                      <span className="text-xs">Love it</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickFeedback('negative')}
                      disabled={feedbackMutation.isPending}
                      className="flex-1 bg-red-50 hover:bg-red-100 border-red-200"
                    >
                      <ThumbsDown className="h-3 w-3 mr-1 text-red-600" />
                      <span className="text-xs">Needs work</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedType && !isSubmitted && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const type = feedbackTypes.find(t => t.type === selectedType);
                    if (!type) return null;
                    const Icon = type.icon;
                    return (
                      <>
                        <Icon className={cn("h-4 w-4", type.color)} />
                        <span className="text-sm font-medium">{type.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {type.description}
                        </Badge>
                      </>
                    );
                  })()}
                </div>

                <Textarea
                  placeholder="Share your thoughts... (optional but helpful)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px] text-sm"
                />

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={feedbackMutation.isPending}
                    size="sm"
                    className="flex-1"
                  >
                    {feedbackMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {isSubmitted && (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-900">Thank you!</p>
                <p className="text-xs text-green-700 mt-1">
                  Your feedback helps us improve StockSense
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}