import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageSquare,
  Lightbulb,
  Search,
  Star
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIRecommendation {
  recommendations: string[];
  reasoning: string;
}

export default function AIAssistant() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: `Hello! I'm your EventHub AI Assistant. I can help you with:

• Finding perfect events for your interests
• Event planning and organization tips
• Connecting with the right service providers
• Answering questions about the platform
• Providing personalized event recommendations

What would you like help with today?`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [preferences, setPreferences] = useState({
    interests: '',
    budget: '',
    eventTypes: ''
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access the AI Assistant',
        variant: "destructive",
      });
      // Redirect to homepage instead of login to prevent auto-login loop
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message })
      });
      return response.json();
    },
    onSuccess: (data: { response: string }) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    },
    onError: (error) => {
      toast({
        title: 'AI Assistant Error',
        description: 'Sorry, I encountered an error. Please try again.',
        variant: "destructive",
      });
    }
  });

  // Recommendations mutation
  const recommendationsMutation = useMutation({
    mutationFn: async (prefs: typeof preferences) => {
      const processedPrefs = {
        interests: prefs.interests.split(',').map(s => s.trim()).filter(Boolean),
        budget: prefs.budget,
        eventTypes: prefs.eventTypes.split(',').map(s => s.trim()).filter(Boolean)
      };
      const response = await apiRequest('/api/ai/recommendations', {
        method: 'POST',
        body: JSON.stringify({ preferences: processedPrefs })
      });
      return response.json();
    },
    onSuccess: (data: AIRecommendation) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `🎯 **Personalized Event Recommendations**

${data.reasoning}

Based on your preferences, I recommend checking out these events. You can find them on the Events page!`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    },
    onError: () => {
      toast({
        title: 'Recommendations Error',
        description: 'Unable to get recommendations right now. Please try again.',
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    await chatMutation.mutateAsync(inputMessage);
  };

  const handleGetRecommendations = () => {
    if (!preferences.interests && !preferences.eventTypes) {
      toast({
        title: 'Preferences Required',
        description: 'Please fill in your interests or event types to get recommendations.',
        variant: "destructive",
      });
      return;
    }
    recommendationsMutation.mutate(preferences);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get personalized event recommendations, planning advice, and answers to your questions about EventHub.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Chat with AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  {/* Messages */}
                  <ScrollArea 
                    ref={scrollAreaRef}
                    className="flex-1 pr-4"
                    data-testid="chat-messages"
                  >
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                          data-testid={`message-${message.role}-${message.id}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-fit">
                              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          {message.role === 'user' && (
                            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full h-fit">
                              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                      {(chatMutation.isPending || recommendationsMutation.isPending) && (
                        <div className="flex gap-3 justify-start">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-fit">
                            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <LoadingSpinner className="w-4 h-4" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Thinking...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about events, planning, or EventHub..."
                      className="flex-1"
                      disabled={chatMutation.isPending}
                      data-testid="input-chat-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || chatMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Get Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Your Interests (comma-separated)
                    </label>
                    <Input
                      value={preferences.interests}
                      onChange={(e) => setPreferences(prev => ({ ...prev, interests: e.target.value }))}
                      placeholder="music, culture, technology..."
                      data-testid="input-interests"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Budget Range (SAR)
                    </label>
                    <Input
                      value={preferences.budget}
                      onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="100-500 SAR"
                      data-testid="input-budget"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Event Types
                    </label>
                    <Input
                      value={preferences.eventTypes}
                      onChange={(e) => setPreferences(prev => ({ ...prev, eventTypes: e.target.value }))}
                      placeholder="conference, workshop, social..."
                      data-testid="input-event-types"
                    />
                  </div>
                  <Button
                    onClick={handleGetRecommendations}
                    disabled={recommendationsMutation.isPending}
                    className="w-full"
                    data-testid="button-get-recommendations"
                  >
                    {recommendationsMutation.isPending ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Getting Recommendations...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Get AI Recommendations
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Help me plan a corporate event for 100 people")}
                    data-testid="button-quick-corporate-event"
                  >
                    Plan Corporate Event
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage("What are the trending events in Saudi Arabia?")}
                    data-testid="button-quick-trending-events"
                  >
                    Trending Events
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage("How do I find the best venues in my city?")}
                    data-testid="button-quick-find-venues"
                  >
                    Find Venues
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Connect me with wedding service providers")}
                    data-testid="button-quick-wedding-services"
                  >
                    Wedding Services
                  </Button>
                </CardContent>
              </Card>

              {/* User Context */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
                        <Badge variant="secondary" data-testid="badge-user-role">
                          {(user as any)?.role || 'User'}
                        </Badge>
                      </div>
                      {(user as any)?.city && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">City:</span>
                          <span className="text-sm font-medium" data-testid="text-user-city">
                            {(user as any).city}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}