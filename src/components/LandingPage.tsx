import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Shield, 
  Users, 
  Rocket, 
  Star, 
  ArrowRight,
  CheckCircle,
  Play,
  Brain,
  Lock,
  Smile,
  Wifi,
  Heart,
  Code,
  Terminal,
  Cpu,
  Database,
  GitBranch,
  Coffee
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [currentCode, setCurrentCode] = useState(0);
  const [sheldonQuote, setSheldonQuote] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  // Enhanced scroll animations with intersection observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('.scroll-animate');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate features
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 4000);
    
    // Auto-rotate code snippets
    const codeInterval = setInterval(() => {
      setCurrentCode(prev => (prev + 1) % 4);
    }, 3000);
    
    // Auto-rotate Sheldon quotes
    const quoteInterval = setInterval(() => {
      setSheldonQuote(prev => (prev + 1) % 6);
    }, 5000);
    
    return () => {
      clearInterval(featureInterval);
      clearInterval(codeInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  const codeSnippets = [
    {
      language: "Python",
      code: `def quantum_message():
    print("HURRAH! Universe connected! 🌌")
    return "Hello from Sheldon's code!"
    
# IQ 187 approved! 🤓`,
      icon: "🐍"
    },
    {
      language: "JavaScript",
      code: `const sheldonSays = () => {
    console.log("HURRAH! Perfect code! 🎯");
    return "Best. Algorithm. Ever.";
};

sheldonSays(); // Genius level!`,
      icon: "⚡"
    },
    {
      language: "C++",
      code: `#include <iostream>
#include <genius>
using namespace std;

int main() {
    cout << "HURRAH! Penny learned to code!" << endl;
    return 187; // Sheldon's IQ
}`,
      icon: "⚙️"
    },
    {
      language: "SQL",
      code: `SELECT * FROM universe 
WHERE intelligence > 187 
AND name = 'Sheldon Cooper'
AND coding_skills = 'LEGENDARY';
-- HURRAH! Returns 1 perfect row 🤓`,
      icon: "🗄️"
    }
  ];

  const features = [
    {
      icon: <Code size={24} />,
      title: "Genius-Level Code",
      description: "Algorithms so elegant, they'd make Einstein weep with joy. HURRAH for computational perfection!",
      color: "from-cyan-400 to-blue-500",
      emoji: "💻",
      tech: "React + TypeScript + Genius"
    },
    {
      icon: <Brain size={24} />,
      title: "IQ 187 Intelligence",
      description: "AI powered by theoretical physics and caffeinated brilliance. HURRAH for machine learning!",
      color: "from-purple-400 to-pink-500",
      emoji: "🧠",
      tech: "Neural Networks + Coffee"
    },
    {
      icon: <Database size={24} />,
      title: "Quantum Database",
      description: "Data storage that exists in multiple dimensions. HURRAH for quantum entanglement!",
      color: "from-green-400 to-cyan-500",
      emoji: "🗄️",
      tech: "Firebase + Quantum Physics"
    },
    {
      icon: <Terminal size={24} />,
      title: "Sheldon's Console",
      description: "Debug conversations like a true coding genius. HURRAH for perfect syntax!",
      color: "from-yellow-400 to-orange-500",
      emoji: "⌨️",
      tech: "Advanced CLI + Bazinga"
    },
    {
      icon: <GitBranch size={24} />,
      title: "Multiverse Control",
      description: "Track conversations across parallel universes. HURRAH for version control!",
      color: "from-blue-400 to-indigo-500",
      emoji: "🌿",
      tech: "Git + String Theory"
    },
    {
      icon: <Cpu size={24} />,
      title: "Quantum Processing",
      description: "Faster than Sheldon solving physics equations. HURRAH for computational speed!",
      color: "from-pink-400 to-red-500",
      emoji: "🔬",
      tech: "Quantum Computing + Genius"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sheldon Cooper",
      role: "Theoretical Physicist & Lead Coder",
      message: "HURRAH! Finally, a messaging app with the computational elegance I demand! The code architecture is more beautiful than string theory. This is the pinnacle of human achievement in software engineering!",
      avatar: "🤓",
      rating: 5,
      location: "Apartment 4A, Pasadena",
      code: "Python, C++, Assembly, Genius",
      celebration: "🎉 HURRAH! 🎉"
    },
    {
      name: "Penny Hofstadter",
      role: "Sales Rep & Coding Student",
      message: "OMG! HURRAH! I actually understand what the guys are talking about now! This app taught me more about coding than all of Leonard's boring explanations combined. Plus it's super pretty! 💅✨",
      avatar: "💁‍♀️",
      rating: 5,
      location: "Apartment 4B, Pasadena",
      code: "HTML, CSS, JavaScript (Learning!)",
      celebration: "🎊 YAY! 🎊"
    },
    {
      name: "Dr. Leonard Hofstadter",
      role: "Experimental Physicist",
      message: "HURRAH for the perfect fusion of scientific rigor and user experience! Even Penny can code now! The quantum encryption would make Einstein do a happy dance in his grave.",
      avatar: "🤓",
      rating: 5,
      location: "Apartment 4A, Pasadena",
      code: "Python, MATLAB, Fortran",
      celebration: "🚀 AMAZING! 🚀"
    }
  ];

  const stats = [
    { value: "∞", label: "Lines of Genius Code", icon: <Code size={20} />, color: "text-cyan-400" },
    { value: "99.9%", label: "Sheldon Approval", icon: <Shield size={20} />, color: "text-green-400" },
    { value: "0ms", label: "Quantum Latency", icon: <Zap size={20} />, color: "text-yellow-400" },
    { value: "187", label: "IQ Required", icon: <Brain size={20} />, color: "text-purple-400" }
  ];

  const sheldonQuotes = [
    "HURRAH! I'm not crazy; my mother had me tested... and my code compiled perfectly!",
    "HURRAH! That's my spot! And that's my favorite IDE with perfect syntax highlighting!",
    "HURRAH! This algorithm is more elegant than string theory itself!",
    "HURRAH! I don't need sleep, I need more caffeine and cleaner code architecture!",
    "HURRAH! Fascinating! This code is almost as beautiful as theoretical physics!",
    "HURRAH! Penny... Penny... Penny... you've actually learned to code! I'm so proud!"
  ];

  const techStack = [
    { name: "React", icon: "⚛️", color: "text-blue-400" },
    { name: "TypeScript", icon: "📘", color: "text-blue-500" },
    { name: "Firebase", icon: "🔥", color: "text-orange-400" },
    { name: "Tailwind", icon: "🎨", color: "text-cyan-400" },
    { name: "Node.js", icon: "🟢", color: "text-green-400" },
    { name: "Python", icon: "🐍", color: "text-yellow-400" }
  ];

  return (
    <div className="min-h-screen galaxy-bg overflow-hidden relative">
      {/* Enhanced Floating Elements with Mouse Parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic floating code symbols with mouse interaction */}
        <div 
          className="absolute text-3xl text-cyan-400 animate-bounce opacity-70 transition-all duration-300" 
          style={{ 
            top: `${10 + mousePosition.y * 0.1}%`, 
            left: `${10 + mousePosition.x * 0.05}%`,
            animationDelay: '0s',
            transform: `rotate(${mousePosition.x * 0.1}deg)`
          }}
        >
          {'<>'}
        </div>
        <div 
          className="absolute text-3xl text-blue-400 animate-bounce opacity-70 transition-all duration-300" 
          style={{ 
            top: `${20 + mousePosition.y * 0.08}%`, 
            right: `${20 + mousePosition.x * 0.03}%`,
            animationDelay: '1s',
            transform: `rotate(${-mousePosition.x * 0.1}deg)`
          }}
        >
          {'{}'}
        </div>
        <div 
          className="absolute text-3xl text-purple-400 animate-bounce opacity-70 transition-all duration-300" 
          style={{ 
            bottom: `${20 + mousePosition.y * 0.06}%`, 
            left: `${20 + mousePosition.x * 0.04}%`,
            animationDelay: '2s'
          }}
        >
          []
        </div>
        <div 
          className="absolute text-3xl text-green-400 animate-bounce opacity-70 transition-all duration-300" 
          style={{ 
            bottom: `${10 + mousePosition.y * 0.07}%`, 
            right: `${10 + mousePosition.x * 0.06}%`,
            animationDelay: '3s'
          }}
        >
          ()
        </div>
        
        {/* Celebration emojis */}
        <div 
          className="absolute text-5xl animate-bounce" 
          style={{ 
            top: `${15 + mousePosition.y * 0.05}%`, 
            left: `${25 + mousePosition.x * 0.03}%`,
            animationDelay: '0s' 
          }}
        >
          🎉
        </div>
        <div 
          className="absolute text-5xl animate-bounce" 
          style={{ 
            top: `${30 + mousePosition.y * 0.04}%`, 
            right: `${25 + mousePosition.x * 0.02}%`,
            animationDelay: '1s' 
          }}
        >
          🤓
        </div>
        <div 
          className="absolute text-5xl animate-bounce" 
          style={{ 
            bottom: `${30 + mousePosition.y * 0.03}%`, 
            left: `${30 + mousePosition.x * 0.04}%`,
            animationDelay: '2s' 
          }}
        >
          💻
        </div>
        <div 
          className="absolute text-5xl animate-bounce" 
          style={{ 
            bottom: `${15 + mousePosition.y * 0.06}%`, 
            right: `${30 + mousePosition.x * 0.05}%`,
            animationDelay: '3s' 
          }}
        >
          ☕
        </div>
        
        {/* Enhanced floating particles with glow */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse transition-all duration-500"
            style={{
              top: `${15 + (i * 4)}%`,
              left: `${8 + (i * 4.5)}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          >
            <div 
              className={`w-3 h-3 bg-gradient-to-r ${features[i % features.length].color} rounded-full opacity-80`}
              style={{
                boxShadow: '0 0 15px rgba(0, 212, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.4)'
              }}
            />
          </div>
        ))}
      </div>

      {/* Hero Section with Enhanced Animations */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 scroll-animate"
        style={{
          transform: `translateY(${scrollY * 0.1}px) rotateX(${scrollY * 0.01}deg)`,
        }}
      >
        <div className={`text-center max-w-7xl mx-auto transition-all duration-1500 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-20 scale-95'}`}>
          
          {/* Enhanced Logo with 3D Effects */}
          <div className="mb-12 relative perspective-1000">
            <div className="w-48 h-48 mx-auto relative transform-3d">
              {/* Multiple orbiting rings */}
              <div className="absolute inset-0 border-3 border-cyan-400/50 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-2 border-2 border-blue-400/60 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              <div className="absolute inset-4 border border-purple-400/70 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
              
              {/* Central Logo with enhanced glow */}
              <div className="absolute inset-12 neon-gradient rounded-full flex items-center justify-center pulse-glow shadow-2xl">
                <Code size={48} className="text-white animate-pulse" />
              </div>
              
              {/* Orbiting tech icons with 3D effect */}
              {techStack.map((tech, i) => (
                <div
                  key={i}
                  className="absolute text-3xl hover:scale-125 transition-all duration-300"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 60}deg) translateX(100px) translateY(-50%) rotateZ(${scrollY * 0.1}deg)`,
                    animation: `orbit ${10 + i * 2}s linear infinite`
                  }}
                >
                  <div className="bg-gradient-to-r from-cyan-400/20 to-blue-600/20 backdrop-blur-sm rounded-full p-2 border border-cyan-400/40">
                    {tech.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Title with Enhanced Effects */}
          <div className="relative mb-12">
            <div className="text-8xl md:text-9xl font-bold font-orbitron tracking-wide mb-6 relative">
              <h1 className="text-white glow-text relative z-10">
                Galaxy<span className="text-cyan-400 animate-pulse">Chat</span>
              </h1>
              {/* Glitch effect layers */}
              <h1 className="absolute inset-0 text-red-400/30 animate-pulse" style={{ transform: 'translate(3px, 3px)' }}>
                Galaxy<span className="text-cyan-400">Chat</span>
              </h1>
              <h1 className="absolute inset-0 text-blue-400/30 animate-pulse" style={{ transform: 'translate(-3px, -3px)' }}>
                Galaxy<span className="text-cyan-400">Chat</span>
              </h1>
            </div>
            
            <div className="text-2xl text-cyan-300 font-space-grotesk mb-6 animate-bounce">
              <span className="text-4xl mr-4">🎉</span> 
              HURRAH! Where Genius Coders Celebrate! 
              <span className="text-4xl ml-4">🤓</span>
            </div>
            
            {/* Enhanced Live Code Display */}
            <div className="galaxy-card p-8 rounded-2xl max-w-3xl mx-auto neon-glow mb-8 hover:scale-105 transition-all duration-500">
              <div className="flex items-center mb-6">
                <Terminal size={24} className="text-cyan-400 mr-3 animate-pulse" />
                <span className="text-cyan-400 font-orbitron text-lg">SHELDON_GENIUS_TERMINAL_v4.0</span>
                <div className="ml-auto flex space-x-3">
                  <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              <div className="text-left font-mono text-lg">
                <div className="text-green-400 mb-3 flex items-center">
                  <span className="mr-2">#</span>
                  <span className="text-2xl mr-2">{codeSnippets[currentCode].icon}</span>
                  <span>{codeSnippets[currentCode].language}</span>
                  <span className="ml-auto text-cyan-400">HURRAH! 🎉</span>
                </div>
                <pre className="text-cyan-200 whitespace-pre-wrap leading-relaxed">{codeSnippets[currentCode].code}</pre>
              </div>
            </div>
          </div>
          
          {/* Enhanced Subtitle */}
          <div className="text-3xl md:text-4xl text-cyan-200 mb-12 max-w-6xl mx-auto leading-relaxed font-space-grotesk">
            <span className="inline-block">Experience the future of </span>
            <span className="text-cyan-400 glow-text font-bold animate-pulse">quantum-coded communication</span>
            <br />
            <span className="text-xl opacity-90 mt-6 block">
              "HURRAH! Finally, a messaging app with the computational elegance I demand!" 
              <span className="text-cyan-400 ml-3 text-2xl">- Dr. Sheldon Cooper 🤓🎉</span>
            </span>
          </div>

          {/* Enhanced Dynamic Sheldon Quote */}
          <div className="mb-12 p-8 galaxy-card rounded-3xl max-w-5xl mx-auto neon-glow hover:scale-105 transition-all duration-500">
            <div className="text-cyan-200 font-space-grotesk text-2xl italic mb-6 leading-relaxed">
              "{sheldonQuotes[sheldonQuote]}"
            </div>
            <div className="text-cyan-400 font-orbitron text-xl flex items-center justify-center">
              <span className="text-3xl mr-3 animate-bounce">🤓</span>
              Dr. Sheldon Cooper - Lead Theoretical Physicist & Code Reviewer
              <Coffee size={24} className="ml-3 text-yellow-400 animate-bounce" />
              <span className="text-3xl ml-3 animate-bounce">🎉</span>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16">
            <button
              onClick={onGetStarted}
              className="group cosmic-button text-white px-12 py-6 rounded-2xl font-medium text-xl transition-all duration-500 font-space-grotesk hover:scale-110"
              style={{
                boxShadow: '0 0 40px rgba(0, 212, 255, 0.6), 0 20px 40px rgba(0, 212, 255, 0.3)'
              }}
            >
              <span className="flex items-center">
                <span className="text-3xl mr-4 animate-bounce">🚀</span>
                HURRAH! Initialize Universe
                <Code size={24} className="ml-4 group-hover:translate-x-2 group-hover:rotate-12 transition-all duration-300" />
              </span>
            </button>
            
            <button className="group galaxy-card text-cyan-200 px-12 py-6 rounded-2xl font-medium text-xl hover:bg-cyan-400/20 transition-all duration-500 font-space-grotesk border-2 border-cyan-400/50 hover:border-cyan-400/80 hover:scale-110">
              <span className="flex items-center">
                <Play size={24} className="mr-4 group-hover:scale-125 transition-transform" />
                <span className="text-3xl mr-3 animate-bounce">🎬</span>
                Watch Genius Demo
              </span>
            </button>
          </div>

          {/* Enhanced Tech Stack Display */}
          <div className="mb-16">
            <h3 className="text-cyan-400 font-orbitron text-2xl mb-8 glow-text animate-pulse">
              🎉 HURRAH! POWERED BY GENIUS-LEVEL TECH STACK 🤓
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              {techStack.map((tech, index) => (
                <div 
                  key={index}
                  className="galaxy-card px-6 py-4 rounded-xl flex items-center space-x-3 hover:scale-125 transition-all duration-500 hover:rotate-3"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)'
                  }}
                >
                  <span className="text-2xl animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}>{tech.icon}</span>
                  <span className={`font-space-grotesk font-bold text-lg ${tech.color}`}>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="galaxy-card p-8 rounded-2xl neon-glow hover:scale-110 transition-all duration-500 hover:rotate-2"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)'
                }}
              >
                <div className={`${stat.color} mb-4 flex justify-center animate-bounce`}>
                  {stat.icon}
                </div>
                <div className={`text-4xl font-bold ${stat.color} mb-3 font-orbitron glow-text`}>{stat.value}</div>
                <div className="text-cyan-200 font-space-grotesk text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-32 px-4 relative scroll-animate">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold font-orbitron text-white mb-8 glow-text">
              <span className="text-4xl mr-4">🎉</span>
              HURRAH! Code-Powered <span className="text-cyan-400 animate-pulse">Features</span>
              <span className="text-4xl ml-4">🤓</span>
            </h2>
            <p className="text-3xl text-cyan-200 max-w-5xl mx-auto font-space-grotesk leading-relaxed">
              Features engineered with the precision of a caffeinated theoretical physicist
            </p>
          </div>

          {/* Enhanced Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="galaxy-card p-10 rounded-3xl cursor-pointer transition-all duration-700 hover:scale-110 hover:rotate-2 neon-glow group"
                onMouseEnter={() => setActiveFeature(index)}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  boxShadow: activeFeature === index ? '0 0 50px rgba(0, 212, 255, 0.8)' : '0 0 20px rgba(0, 212, 255, 0.4)'
                }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-6 animate-bounce" style={{ animationDelay: `${index * 0.1}s` }}>{feature.emoji}</div>
                  <div className={`w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center bg-gradient-to-r ${feature.color} group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-3xl font-semibold text-white mb-6 font-space-grotesk glow-text">
                    {feature.title}
                  </h3>
                  <p className="text-cyan-200 font-space-grotesk leading-relaxed mb-6 text-lg">
                    {feature.description}
                  </p>
                  <div className="galaxy-card px-4 py-2 rounded-full inline-block hover:scale-110 transition-transform">
                    <span className="text-cyan-400 font-mono text-lg">{feature.tech}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-32 px-4 relative scroll-animate">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold font-orbitron text-white mb-8 glow-text">
              <span className="text-4xl mr-4">🎉</span>
              What the <span className="text-cyan-400 animate-pulse">Coding Gang</span> Says
              <span className="text-4xl ml-4">🤓</span>
            </h2>
            <p className="text-3xl text-cyan-200 max-w-5xl mx-auto font-space-grotesk">
              HURRAH! Reviews from Apartment 4A's finest minds (and Penny!)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="galaxy-card p-10 rounded-3xl neon-glow floating-animation hover:scale-110 hover:rotate-1 transition-all duration-700"
                style={{ 
                  animationDelay: `${index * 0.3}s`,
                  boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)'
                }}
              >
                <div className="flex items-center mb-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mr-6 bg-gradient-to-r from-cyan-400/40 to-blue-600/40 border-3 border-cyan-400/60 animate-pulse">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold font-space-grotesk glow-text text-xl">{testimonial.name}</h4>
                    <p className="text-cyan-300 font-space-grotesk">{testimonial.role}</p>
                    <p className="text-cyan-400 text-sm font-space-grotesk opacity-70">{testimonial.location}</p>
                  </div>
                </div>
                
                <p className="text-cyan-200 font-space-grotesk italic leading-relaxed mb-8 text-lg">
                  "{testimonial.message}"
                </p>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={20} className="text-cyan-400 fill-current mr-1 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <div className="text-cyan-400 font-space-grotesk font-bold">
                    Verified Genius ✨
                  </div>
                </div>
                
                <div className="galaxy-card px-4 py-3 rounded-xl mb-4">
                  <div className="text-cyan-300 font-mono">
                    <Code size={16} className="inline mr-2" />
                    Languages: {testimonial.code}
                  </div>
                </div>
                
                <div className="text-center text-2xl animate-bounce">
                  {testimonial.celebration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA */}
      <section className="py-32 px-4 relative scroll-animate">
        <div className="max-w-6xl mx-auto text-center">
          <div className="galaxy-card p-20 rounded-3xl neon-glow hover:scale-105 transition-all duration-700" style={{ boxShadow: '0 0 60px rgba(0, 212, 255, 0.6)' }}>
            <div className="mb-16">
              <div className="w-32 h-32 mx-auto neon-gradient rounded-full flex items-center justify-center pulse-glow mb-12 floating-animation">
                <Code size={48} className="text-white" />
              </div>
              <h2 className="text-6xl md:text-7xl font-bold font-orbitron text-white mb-12 glow-text">
                <span className="text-4xl mr-4">🎉</span>
                HURRAH! Join the <span className="text-cyan-400 animate-pulse">Code Universe</span>
                <span className="text-4xl ml-4">🤓</span>
              </h2>
              <p className="text-3xl text-cyan-200 mb-16 font-space-grotesk leading-relaxed">
                Step into a world where brilliant minds code the future
                <br />of quantum communication together
                <br />
                <span className="text-cyan-400 text-2xl mt-4 block">HURRAH for computational excellence! 🚀</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-10 justify-center items-center mb-16">
              <button
                onClick={onGetStarted}
                className="group cosmic-button text-white px-16 py-8 rounded-3xl font-medium text-3xl transition-all duration-500 font-space-grotesk hover:scale-110"
                style={{
                  boxShadow: '0 0 50px rgba(0, 212, 255, 0.8)'
                }}
              >
                <span className="flex items-center">
                  <span className="text-4xl mr-6 animate-bounce">🚀</span>
                  HURRAH! Execute Universe.join()
                  <ArrowRight size={32} className="ml-6 group-hover:translate-x-3 group-hover:scale-125 transition-all duration-300" />
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-cyan-300">
              <div className="flex items-center justify-center text-xl">
                <CheckCircle size={28} className="mr-4 text-cyan-400 animate-pulse" />
                <span className="font-space-grotesk">🤓 Sheldon Approved</span>
              </div>
              <div className="flex items-center justify-center text-xl">
                <CheckCircle size={28} className="mr-4 text-cyan-400 animate-pulse" />
                <span className="font-space-grotesk">💻 Developer Friendly</span>
              </div>
              <div className="flex items-center justify-center text-xl">
                <CheckCircle size={28} className="mr-4 text-cyan-400 animate-pulse" />
                <span className="font-space-grotesk">🌌 Universe Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-20 px-4 border-t border-cyan-400/30 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-12 md:mb-0">
              <div className="w-20 h-20 neon-gradient rounded-full flex items-center justify-center mr-6 pulse-glow">
                <Code size={32} className="text-white" />
              </div>
              <div>
                <span className="text-4xl font-bold font-orbitron text-white glow-text">GalaxyChat</span>
                <p className="text-cyan-300 font-space-grotesk text-xl">HURRAH! Where Genius Coders Unite 🤓💻🎉</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-12 text-cyan-300 font-space-grotesk text-lg">
              <div className="flex items-center">
                <Brain size={24} className="mr-3 animate-pulse" />
                <span>Powered by Science & Code</span>
              </div>
              <div className="flex items-center">
                <Coffee size={24} className="mr-3 animate-bounce" />
                <span>Fueled by Caffeine</span>
              </div>
              <div className="flex items-center">
                <Sparkles size={24} className="mr-3 animate-pulse" />
                <span>© 2025 Apartment 4A Labs</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center text-cyan-400 font-space-grotesk">
            <p className="italic text-2xl mb-6 leading-relaxed">
              "HURRAH! This code is so elegant, it brings tears to my eyes. And I don't cry... except when my code compiles perfectly on the first try!" 
              <span className="text-cyan-400 ml-3 text-3xl">- Sheldon Cooper 🤓🎉</span>
            </p>
            <div className="galaxy-card p-6 rounded-2xl max-w-3xl mx-auto neon-glow">
              <div className="font-mono text-xl text-cyan-300">
                <span className="text-green-400">console.log(</span>
                <span className="text-yellow-400">"HURRAH! Best messaging app in the multiverse!"</span>
                <span className="text-green-400">);</span>
                <div className="text-cyan-400 mt-2">// Output: Pure genius! 🤓✨</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;