import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  Home,
  Play,
  Pause,
  Code,
  Monitor,
  Smartphone,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface BrowserAction {
  type: string;
  url?: string;
  selector?: string;
  text?: string;
  key?: string;
  timeout?: number;
}

interface BrowserPreviewProps {
  actions: BrowserAction[];
  onExecuteActions: (actions: BrowserAction[]) => void;
  isExecuting: boolean;
}

export const BrowserPreview = ({ actions, onExecuteActions, isExecuting }: BrowserPreviewProps) => {
  const [currentUrl, setCurrentUrl] = useState('about:blank');
  const [currentStep, setCurrentStep] = useState(-1);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [executionComplete, setExecutionComplete] = useState(false);
  const [realBrowserUrl, setRealBrowserUrl] = useState<string | null>(null);

  // Get the initial URL from the first goto action
  useEffect(() => {
    if (actions.length > 0) {
      const gotoAction = actions.find(action => action.type === 'goto');
      if (gotoAction?.url) {
        setCurrentUrl(gotoAction.url);
      }
    }
    setExecutionComplete(false);
    setCurrentStep(-1);
  }, [actions]);

  const handleRefresh = () => {
    // Simulate refresh
    setCurrentStep(-1);
    setExecutionComplete(false);
  };

  const handleBack = () => {
    // Simulate back navigation
    console.log('Back navigation');
  };

  const handleForward = () => {
    // Simulate forward navigation
    console.log('Forward navigation');
  };

  const openInRealBrowser = () => {
    if (currentUrl && currentUrl !== 'about:blank') {
      window.open(currentUrl, '_blank');
      setRealBrowserUrl(currentUrl);
    }
  };
  const handleExecuteActions = () => {
    if (actions.length > 0) {
      onExecuteActions(actions);
      setCurrentStep(0);
      setExecutionComplete(false);
      
      // Simulate step-by-step execution
      actions.forEach((_, index) => {
        setTimeout(() => {
          setCurrentStep(index);
          if (index === actions.length - 1) {
            setTimeout(() => {
              setExecutionComplete(true);
            }, 1000);
          }
        }, (index + 1) * 1500);
      });
    }
  };

  const getActionDescription = (action: BrowserAction) => {
    switch (action.type) {
      case 'goto':
        return `Navigate to ${action.url}`;
      case 'click':
        return `Click element: ${action.selector}`;
      case 'type':
        return `Type "${action.text}" into ${action.selector}`;
      case 'press':
        return `Press ${action.key} key`;
      case 'waitForSelector':
        return `Wait for element: ${action.selector}`;
      case 'waitForTimeout':
        return `Wait ${action.timeout}ms`;
      case 'scroll':
        return 'Scroll page';
      case 'screenshot':
        return 'Take screenshot';
      default:
        return `Execute ${action.type}`;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'goto':
        return <Globe className="h-4 w-4" />;
      case 'click':
        return <Monitor className="h-4 w-4" />;
      case 'type':
        return <Code className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Browser Controls */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Browser Preview
            </CardTitle>
            <div className="flex items-center gap-2">
              {currentUrl !== 'about:blank' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInRealBrowser}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Real Browser
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
              >
                {viewMode === 'desktop' ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Navigation Bar */}
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleForward}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4" />
            </Button>
            <Input
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              className="flex-1"
              placeholder="Enter URL..."
            />
            {actions.length > 0 && (
              <Button 
                onClick={handleExecuteActions}
                disabled={isExecuting}
                variant="hero"
                size="sm"
              >
                {isExecuting ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Running
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Execute
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Status Bar */}
          {executionComplete && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Browser automation completed successfully! 
                {realBrowserUrl && (
                  <span className="ml-2">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={openInRealBrowser}
                      className="h-auto p-0 text-green-700 dark:text-green-300"
                    >
                      Open in real browser →
                    </Button>
                  </span>
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browser Content Area */}
      <Card className="flex-1 rounded-t-none border-t-0">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full p-4">
            {/* Browser View */}
            <div className={`${showCode ? 'lg:col-span-2' : 'lg:col-span-3'} h-full`}>
              <div className={`browser-preview rounded-lg h-full min-h-[400px] relative overflow-hidden ${
                viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
              }`}>
                {currentUrl === 'about:blank' ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No page loaded</p>
                      <p className="text-sm text-muted-foreground">Execute browser actions to see preview</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
                    <div className="text-center p-8">
                      <Globe className="h-20 w-20 text-blue-500 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold mb-4">Browser Simulation</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        This is a preview of the browser automation. The actual actions will be performed in a real browser window.
                      </p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border">
                        <p className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                          {currentUrl}
                        </p>
                      </div>
                      <Button onClick={openInRealBrowser} variant="hero" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open in Real Browser
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Execution Overlay */}
                {isExecuting && currentStep >= 0 && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <Card className="ai-glow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm font-medium">
                            Step {currentStep + 1}: {actions[currentStep] ? getActionDescription(actions[currentStep]) : 'Processing...'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Panel */}
            {showCode && (
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm">Browser Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-full max-h-[500px]">
                      <div className="p-4 space-y-2">
                        {actions.length === 0 ? (
                          <div className="text-center text-muted-foreground text-sm">
                            No actions to execute
                          </div>
                        ) : (
                          actions.map((action, index) => (
                            <div
                              key={index}
                              className={`flex items-center gap-2 p-2 rounded border ${
                                currentStep === index 
                                  ? 'border-primary bg-primary/10' 
                                  : currentStep > index 
                                    ? 'border-green-500 bg-green-500/10'
                                    : 'border-border'
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {getActionIcon(action.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Badge variant="outline" className="text-xs mb-1">
                                  {action.type}
                                </Badge>
                                <p className="text-xs text-muted-foreground truncate">
                                  {getActionDescription(action)}
                                </p>
                              </div>
                              {currentStep === index && (
                                <div className="animate-pulse h-2 w-2 bg-primary rounded-full" />
                              )}
                              {currentStep > index && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};