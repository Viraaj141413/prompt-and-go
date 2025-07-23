import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthForm } from '@/components/auth/AuthForm';
import { ChatInterface } from '@/components/chat/ChatInterface';

interface IndexProps {
  user: User | null;
  session: Session | null;
}

const Index = ({ user, session }: IndexProps) => {
  const [showAuth, setShowAuth] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  // If user is authenticated, show chat interface
  if (user && session) {
    return <ChatInterface user={user} onSignOut={handleSignOut} />;
  }

  // If showing auth form
  if (showAuth) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // Default: show landing page
  return <LandingPage onGetStarted={handleGetStarted} />;
};

export default Index;
