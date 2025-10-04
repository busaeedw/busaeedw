import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/loading';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Send, MessageSquare } from 'lucide-react';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function Messages() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('common.unauthorized'),
        description: t('common.unauthorized.desc'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: conversations, isLoading: conversationsLoading, error: conversationsError } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: messages, isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ['/api/messages', selectedConversation],
    enabled: isAuthenticated && !!selectedConversation,
    retry: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      const response = await apiRequest('POST', '/api/messages', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setMessageText('');
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('common.unauthorized'),
          description: t('common.unauthorized.desc'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [conversationsError, messagesError].filter(Boolean);
    errors.forEach(error => {
      if (error && isUnauthorizedError(error)) {
        toast({
          title: t('common.unauthorized'),
          description: t('common.unauthorized.desc'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    });
  }, [conversationsError, messagesError, toast]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      content: messageText.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner className="mx-auto" size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with event organizers and service providers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {conversationsLoading ? (
                    <div className="p-4">
                      <LoadingSkeleton lines={3} />
                    </div>
                  ) : conversations && conversations.length > 0 ? (
                    <div className="divide-y">
                      {conversations.map((conversation: any) => (
                        <div
                          key={conversation.user.id}
                          onClick={() => setSelectedConversation(conversation.user.id)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedConversation === conversation.user.id ? 'bg-blue-50 border-r-2 border-saudi-green' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={conversation.user.profileImageUrl} />
                              <AvatarFallback>
                                {conversation.user.firstName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {conversation.user.firstName || conversation.user.email}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                            {!conversation.lastMessage.read && 
                             conversation.lastMessage.receiverId === user?.id && (
                              <div className="w-2 h-2 bg-saudi-green rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No conversations yet</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <Card>
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b">
                    <CardTitle>
                      {conversations?.find((c: any) => c.user.id === selectedConversation)?.user.firstName || 'Conversation'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-96 p-4">
                      {messagesLoading ? (
                        <LoadingSkeleton lines={5} />
                      ) : messages && messages.length > 0 ? (
                        <div className="space-y-4">
                          {messages.map((message: any) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.senderId === user?.id ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.senderId === user?.id
                                    ? 'bg-saudi-green text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.senderId === user?.id ? 'text-green-100' : 'text-gray-500'
                                }`}>
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No messages yet. Start the conversation!</p>
                        </div>
                      )}
                    </ScrollArea>
                    
                    {/* Message Input */}
                    <div className="border-t p-4">
                      <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1"
                          disabled={sendMessageMutation.isPending}
                        />
                        <Button
                          type="submit"
                          disabled={!messageText.trim() || sendMessageMutation.isPending}
                          className="bg-saudi-green hover:bg-saudi-green/90"
                        >
                          {sendMessageMutation.isPending ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-8">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a conversation from the left to start messaging
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
