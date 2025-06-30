import React, { useState, useEffect } from 'react';
import { register, login, signInWithGoogle } from '../firebase/auth';
import { Sparkles, Rocket, Star, Zap, Orbit } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Trigger form animation after component mounts
    const timer = setTimeout(() => setShowForm(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          throw new Error('Display name is required');
        }
        await register(email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'An error occurred with Google sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen galaxy-bg flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        <div className="particle" style={{ top: '10%', left: '10%', animationDelay: '0s' }}></div>
        <div className="particle" style={{ top: '20%', right: '15%', animationDelay: '1s' }}></div>
        <div className="particle" style={{ bottom: '30%', left: '20%', animationDelay: '2s' }}></div>
        <div className="particle" style={{ top: '60%', right: '25%', animationDelay: '3s' }}></div>
        <div className="particle" style={{ bottom: '20%', right: '10%', animationDelay: '4s' }}></div>
        <div className="particle" style={{ top: '40%', left: '5%', animationDelay: '2.5s' }}></div>
        
        {/* Orbiting Elements */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4">
          <div className="cosmic-orb w-2 h-2 neon-gradient rounded-full"></div>
        </div>
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6">
          <div className="cosmic-orb w-3 h-3 electric-gradient rounded-full" style={{ animationDelay: '2s', animationDuration: '12s' }}></div>
        </div>
        
        {/* Energy Waves */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-blue-400/20 energy-wave"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-cyan-400/30 energy-wave" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-blue-300/40 energy-wave" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className={`max-w-md w-full neon-card rounded-3xl overflow-hidden shadow-2xl login-container transition-all duration-700 ${showForm ? 'opacity-100 transform-none' : 'opacity-0 transform scale-95'}`}>
        <div className="neon-gradient py-10 px-6 text-white text-center relative hologram-effect">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
          <div className="relative z-10">
            <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 pulse-glow floating-animation">
              <Sparkles size={42} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold font-orbitron tracking-wide mb-3 glow-text">GalaxyChat</h2>
            <p className="text-cyan-100 font-space-grotesk text-lg">Connect across the cosmos</p>
            <div className="flex justify-center mt-4 space-x-2">
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-slate-900/30 backdrop-blur-sm">
          <div className="mb-8 flex justify-center space-x-6 border-b border-cyan-400/30 pb-4">
            <button
              className={`pb-3 px-6 font-medium transition-all duration-500 font-space-grotesk relative ${
                isLogin 
                  ? 'border-b-2 border-cyan-400 text-cyan-400 glow-text' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              onClick={() => setIsLogin(true)}
            >
              <Star size={18} className="inline mr-2" />
              Login
              {isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 neon-glow"></div>}
            </button>
            <button
              className={`pb-3 px-6 font-medium transition-all duration-500 font-space-grotesk relative ${
                !isLogin 
                  ? 'border-b-2 border-blue-400 text-blue-400 glow-text' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              onClick={() => setIsLogin(false)}
            >
              <Rocket size={18} className="inline mr-2" />
              Register
              {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 neon-glow"></div>}
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-400/50 text-red-300 rounded-xl backdrop-blur-sm neon-glow animate-pulse">
              <div className="flex items-center">
                <Zap size={16} className="mr-2" />
                {error}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="form-field-enter" style={{ animationDelay: '0.1s' }}>
                <label htmlFor="displayName" className="block text-cyan-300 text-sm font-medium mb-3 font-space-grotesk glow-text">
                  <Orbit size={16} className="inline mr-2" />
                  Cosmic Identity
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-4 galaxy-input rounded-xl focus:outline-none transition-all duration-300 font-space-grotesk neon-border"
                  placeholder="Your stellar name..."
                />
              </div>
            )}
            
            <div className="form-field-enter" style={{ animationDelay: '0.2s' }}>
              <label htmlFor="email" className="block text-cyan-300 text-sm font-medium mb-3 font-space-grotesk glow-text">
                <Star size={16} className="inline mr-2" />
                Galactic Coordinates
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 galaxy-input rounded-xl focus:outline-none transition-all duration-300 font-space-grotesk neon-border"
                placeholder="your.email@galaxy.com"
              />
            </div>
            
            <div className="form-field-enter" style={{ animationDelay: '0.3s' }}>
              <label htmlFor="password" className="block text-cyan-300 text-sm font-medium mb-3 font-space-grotesk glow-text">
                <Zap size={16} className="inline mr-2" />
                Quantum Security Code
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 galaxy-input rounded-xl focus:outline-none transition-all duration-300 font-space-grotesk neon-border"
                placeholder="••••••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full cosmic-button text-white py-4 px-6 rounded-xl font-medium transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed font-space-grotesk text-lg form-field-enter"
              style={{ animationDelay: '0.4s' }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span>Connecting to Galaxy...</span>
                  <Sparkles size={18} className="ml-2 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>{isLogin ? 'Launch Into Galaxy' : 'Join the Cosmos'}</span>
                  <Rocket size={20} className="ml-3" />
                </div>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center form-field-enter" style={{ animationDelay: '0.5s' }}>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cyan-400/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/50 text-cyan-300 font-space-grotesk">OR TRAVEL VIA</span>
              </div>
            </div>
            
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center galaxy-card text-cyan-200 py-4 px-6 rounded-xl font-medium hover:bg-cyan-400/10 transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed font-space-grotesk border-2 border-cyan-400/30 hover:border-cyan-400/60 neon-glow"
            >
              <svg className="h-6 w-6 mr-4" viewBox="0 0 24 24">
                <path
                  fill="#00d4ff"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"
                />
              </svg>
              <span>Google Galaxy Portal</span>
              <Sparkles size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;