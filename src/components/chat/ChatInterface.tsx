import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Globe, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    type: 'browser_action';
    url?: string;
    description: string;
  };
}

interface ChatInterfaceProps {
  user: any;
  onSignOut: () => void;
}

export const ChatInterface = ({ user, onSignOut }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI browser assistant. Tell me what you\'d like me to do - like "order me a latte" or "book a flight to Paris" and I\'ll help you with browser actions!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callOpenRouterAPI = async (userMessage: string) => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "qwen/qwen-2.5-72b-instruct",
          messages: [
            {
              role: "system",
              content: `You are an AI browser assistant that helps users perform tasks on the web. When a user asks you to do something like "order me a latte" or "book a flight", you should:

1. Acknowledge what they want to do
2. Explain the steps you would take to accomplish this task
3. Provide a relevant website URL where this action could be performed
4. Be helpful and suggest specific actions

Always respond in a friendly, helpful tone and include practical next steps. If the request involves purchasing or booking something, remind them they'll need to complete the transaction themselves for security.

Format your response as JSON with:
{
  "message": "Your helpful response",
  "action": {
    "type": "browser_action",
    "url": "https://example.com",
    "description": "Description of what to do on this site"
  }
}

If no specific action is needed, omit the action field.`
            },
            { 
              role: "user", 
              content: userMessage 
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Try to parse as JSON, fallback to plain text
      try {
        const parsed = JSON.parse(aiResponse);
        return {
          message: parsed.message,
          action: parsed.action
        };
      } catch {
        return {
          message: aiResponse,
          action: null
        };
      }
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await callOpenRouterAPI(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        action: aiResponse.action
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If there's a browser action, show a toast and optionally open the URL
      if (aiResponse.action?.url) {
        toast({
          title: "Browser Action Available",
          description: `Click to visit: ${aiResponse.action.description}`,
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(aiResponse.action.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          ),
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">AI Browser Assistant</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardContent className="flex-1 p-0">
            <ScrollArea ref={scrollAreaRef} className="h-full p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground chat-bubble'
                          : 'bg-muted chat-bubble-ai'
                      } p-3 rounded-lg`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {message.role === 'assistant' ? (
                          <Bot className="h-4 w-4 mt-1 text-primary" />
                        ) : (
                          <User className="h-4 w-4 mt-1" />
                        )}
                        <span className="text-sm font-medium">
                          {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.action && (
                        <div className="mt-3 p-2 bg-card/50 rounded border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium">Browser Action</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{message.action.description}</p>
                          {message.action.url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(message.action.url, '_blank')}
                              className="text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open Website
                            </Button>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted chat-bubble-ai p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me what you'd like me to do... (e.g., 'order me a latte', 'book a flight to Paris')"
            className="flex-1"
            disabled={loading}
          />
          <Button onClick={handleSendMessage} disabled={loading || !input.trim()} variant="hero">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};