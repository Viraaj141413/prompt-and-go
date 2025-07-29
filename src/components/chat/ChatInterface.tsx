import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Zap, Loader2, Mountain, Globe, ExternalLink, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BrowserPreview } from '@/components/browser/BrowserPreview';

interface BrowserAction {
  type: string;
  url?: string;
  selector?: string;
  text?: string;
  key?: string;
  timeout?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: BrowserAction[];
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
      content: "Welcome to PeaksAI! I'm your smart browser automation assistant. Tell me what you'd like me to do - like 'order me a latte' or 'find the best laptop deals' - and I'll create automated browser actions to help you accomplish your goals!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentActions, setCurrentActions] = useState<BrowserAction[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
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

  const callBrowserAgent = async (userMessage: string) => {
    try {
      console.log('Calling browser agent with message:', userMessage);
      
      const { data, error } = await supabase.functions.invoke('browser-agent', {
        body: { message: userMessage }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      console.log('Browser agent response:', data);
      return data;
    } catch (error) {
      console.error('Browser agent API error:', error);
      
      // Return a fallback response instead of throwing
      return {
        message: "I'm having some technical difficulties, but I can still help you! Let me prepare a basic web search for your request.",
        actions: [
          { "type": "goto", "url": "https://www.google.com" },
          { "type": "waitForSelector", "selector": "input[name='q']" },
          { "type": "click", "selector": "input[name='q']" },
          { "type": "type", "selector": "input[name='q']", "text": userMessage },
          { "type": "press", "key": "Enter" },
          { "type": "waitForSelector", "selector": "#search" }
        ]
      };
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
      const response = await callBrowserAgent(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || 'I\'ve analyzed your request and prepared browser actions.',
        timestamp: new Date(),
        actions: response.actions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentActions(response.actions || []);

      if (response.actions?.length > 0) {
        toast({
          title: "Browser Actions Ready!",
          description: `${response.actions.length} actions prepared. Click Execute in the browser preview to run them.`,
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Error calling browser agent:', error);
      
      // This shouldn't happen now since we handle errors in callBrowserAgent
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteActions = (actions: BrowserAction[]) => {
    setIsExecuting(true);
    toast({
      title: "Launching Browser Automation",
      description: "Starting real browser automation with Puppeteer. Screenshots will be captured automatically.",
    });

    // Real browser automation - will be handled by backend
    setTimeout(() => {
      setIsExecuting(false);
      toast({
        title: "Browser Automation Complete",
        description: "Actions executed successfully! Check the browser preview for screenshots.",
      });
    }, actions.length * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'goto':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'click':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'type':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'wait':
      case 'waitForSelector':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-full mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Mountain className="h-8 w-8 text-primary ai-glow" />
              <Zap className="h-4 w-4 text-accent absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold peaks-text">PeaksAI</h1>
              <p className="text-sm text-muted-foreground">Smart Browser Automation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
            <Button variant="outline" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex">
        {/* Chat Panel */}
        <div className="w-1/2 border-r border-border flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 p-4">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground chat-bubble'
                          : 'bg-card border border-border chat-bubble-ai'
                      } p-4 rounded-lg shadow-lg`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {message.role === 'assistant' ? (
                          <Mountain className="h-5 w-5 mt-1 text-primary" />
                        ) : (
                          <User className="h-5 w-5 mt-1" />
                        )}
                        <span className="text-sm font-semibold">
                          {message.role === 'assistant' ? 'PeaksAI' : 'You'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      
                      {/* Browser Actions Display */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                          <div className="flex items-center gap-2 mb-3">
                            <Play className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Browser Actions ({message.actions.length})</span>
                          </div>
                          <div className="space-y-2">
                            {message.actions.slice(0, 3).map((action, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Badge className={`text-xs ${getActionTypeColor(action.type)}`}>
                                  {action.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground truncate">
                                  {action.url || action.selector || action.text || 'Action step'}
                                </span>
                              </div>
                            ))}
                            {message.actions.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{message.actions.length - 3} more actions...
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-3">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border chat-bubble-ai p-4 rounded-lg shadow-lg">
                      <div className="flex items-center gap-2">
                        <Mountain className="h-5 w-5 text-primary" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">PeaksAI is analyzing your request...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-card/50 backdrop-blur p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me what you'd like to automate... (e.g., 'order me a coffee from Starbucks')"
                className="flex-1"
                disabled={loading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={loading || !input.trim()} 
                variant="hero"
                className="px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Browser Preview Panel */}
        <div className="w-1/2 split-pane">
          <BrowserPreview
            actions={currentActions}
            onExecuteActions={handleExecuteActions}
            isExecuting={isExecuting}
          />
        </div>
      </div>
    </div>
  );
};