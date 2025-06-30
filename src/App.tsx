import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import LandingPage from './components/LandingPage';
import { createChat } from './firebase/chat';
import { MessageSquare, Sparkles, Zap } from 'lucide-react';

function AppContent() {
  const { currentUser } = useAuth();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create a new chat with a user
  const handleNewChat = async (userId: string) => {
    if (!currentUser) return;
    
    try {
      const chatId = await createChat(currentUser.uid, userId);
      setActiveChatId(chatId);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  // Handle going back to the chat list on mobile
  const handleBackToList = () => {
    setActiveChatId(null);
  };

  // Handle getting started from landing page
  const handleGetStarted = () => {
    setShowLanding(false);
    setShowAuth(true);
  };

  // If user is not logged in, show landing page or auth screen
  if (!currentUser) {
    if (showLanding && !showAuth) {
      return <LandingPage onGetStarted={handleGetStarted} />;
    }
    return <AuthScreen />;
  }

  return (
    <div className="h-screen galaxy-bg flex flex-col relative overflow-hidden">
      {/* Enhanced shooting stars with neon effect */}
      <div className="shooting-star" style={{ top: '15%', animationDelay: '0s' }}></div>
      <div className="shooting-star" style={{ top: '35%', animationDelay: '1.5s' }}></div>
      <div className="shooting-star" style={{ top: '55%', animationDelay: '3s' }}></div>
      <div className="shooting-star" style={{ top: '75%', animationDelay: '4.5s' }}></div>
      
      {/* Galaxy header for mobile */}
      <div className="neon-gradient text-white p-4 md:hidden shadow-lg relative hologram-effect">
        <div className="flex items-center">
          <div className="w-10 h-10 mr-3 cosmic-gradient rounded-full flex items-center justify-center pulse-glow">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold font-orbitron tracking-wide glow-text">GalaxyChat</h1>
          <div className="ml-auto">
            <Zap size={18} className="text-cyan-200 animate-pulse" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Show sidebar if no active chat on mobile, or always on larger screens */}
        {(!activeChatId || !isMobileView) && (
          <Sidebar 
            setActiveChatId={setActiveChatId} 
            activeChatId={activeChatId}
            onNewChat={handleNewChat}
          />
        )}
        
        {/* Show chat window if there's an active chat */}
        {activeChatId && (
          <div className={`flex-1 ${isMobileView ? 'w-full' : ''}`}>
            <ChatWindow 
              chatId={activeChatId} 
              onBack={handleBackToList} 
            />
          </div>
        )}
        
        {/* Enhanced empty state when no chat is selected on larger screens */}
        {!activeChatId && !isMobileView && (
          <div className="flex-1 galaxy-bg flex items-center justify-center relative">
            {/* Background energy waves */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 rounded-full border border-cyan-400/20 energy-wave"></div>
              <div className="absolute w-80 h-80 rounded-full border border-blue-400/30 energy-wave" style={{ animationDelay: '1s' }}></div>
              <div className="absolute w-64 h-64 rounded-full border border-cyan-300/40 energy-wave" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="text-center p-8 floating-animation relative z-10">
              <div className="w-32 h-32 mx-auto mb-8 neon-gradient rounded-full flex items-center justify-center shadow-2xl pulse-glow">
                <MessageSquare size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 font-orbitron tracking-wide glow-text">
                Welcome to GalaxyChat
              </h2>
              <p className="text-cyan-200 max-w-lg leading-relaxed font-space-grotesk text-xl mb-8">
                Connect across the cosmos. Select a chat from the sidebar or start a new conversation 
                to begin your interstellar messaging journey.
              </p>
              <div className="flex justify-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse neon-glow"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse neon-glow" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse neon-glow" style={{ animationDelay: '0.6s' }}></div>
              </div>
              <div className="flex items-center justify-center text-cyan-300 font-space-grotesk">
                <Zap size={16} className="mr-2 animate-pulse" />
                <span className="text-sm">Powered by Quantum Communication</span>
                <Zap size={16} className="ml-2 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;