import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles, Globe, Zap, Shield, Users } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Bot className="h-20 w-20 text-primary ai-glow" />
              <Sparkles className="h-8 w-8 text-accent absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Browser Assistant
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Just tell your AI what you want to do, and it will navigate the web for you. 
            Order food, book flights, shop online - all with simple natural language commands.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" variant="hero" onClick={onGetStarted} className="text-lg px-8 py-6">
              <Zap className="h-5 w-5 mr-2" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              <Globe className="h-5 w-5 mr-2" />
              View Demo
            </Button>
          </div>

          {/* Example Commands */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              '"Order me a latte from Starbucks"',
              '"Book a flight to Paris next week"',
              '"Find me the best laptop deals"'
            ].map((command, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur border border-primary/20">
                <CardContent className="p-4">
                  <p className="text-sm font-mono text-primary">{command}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose Our AI Assistant?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-12 w-12 text-primary" />,
                title: "Lightning Fast",
                description: "Get instant responses and browser actions with our advanced AI technology."
              },
              {
                icon: <Shield className="h-12 w-12 text-primary" />,
                title: "Secure & Private",
                description: "Your data is protected with enterprise-grade security and privacy measures."
              },
              {
                icon: <Globe className="h-12 w-12 text-primary" />,
                title: "Universal Web Access",
                description: "Access any website and perform complex actions with simple voice commands."
              }
            ].map((feature, index) => (
              <Card key={index} className="ai-glow bg-card/50 backdrop-blur">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Tell the AI",
                description: "Simply type what you want to do in natural language"
              },
              {
                step: "2", 
                title: "AI Understands",
                description: "Our AI interprets your request and plans the browser actions"
              },
              {
                step: "3",
                title: "Action Taken",
                description: "Get direct links and instructions to complete your task"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 ai-glow">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="ai-glow bg-card/50 backdrop-blur">
            <CardContent className="p-12">
              <Users className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of users who are already using AI to automate their web browsing.
              </p>
              <Button size="lg" variant="gradient" onClick={onGetStarted} className="text-lg px-12 py-6">
                <Sparkles className="h-5 w-5 mr-2" />
                Start Your AI Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 AI Browser Assistant. Powered by advanced AI technology.</p>
        </div>
      </footer>
    </div>
  );
};