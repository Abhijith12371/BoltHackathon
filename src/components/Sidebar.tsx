import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserChats } from '../firebase/chat';
import { searchUsers } from '../firebase/users';
import ChatList from './ChatList';
import UserSearch from './UserSearch';
import { User } from '../firebase/users';
import { 
  Search, 
  MoreVertical, 
  LogOut,
  Sparkles,
  Satellite,
  Zap
} from 'lucide-react';
import { signOut } from '../firebase/auth';

interface SidebarProps {
  setActiveChatId: (chatId: string) => void;
  activeChatId: string | null;
  onNewChat: (userId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveChatId, activeChatId, onNewChat }) => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Listen to user chats
      const unsubscribe = getUserChats(currentUser.uid, (chatsData) => {
        setChats(chatsData);
      });
      
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim() && currentUser) {
      const results = await searchUsers(term, currentUser.uid);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 galaxy-card border-r border-cyan-400/30 h-full flex flex-col backdrop-blur-xl">
      {/* Header */}
      <div className="neon-gradient px-4 py-4 flex items-center justify-between border-b border-cyan-400/30">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full galaxy-card flex items-center justify-center overflow-hidden pulse-glow border-2 border-cyan-400/50">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="text-lg font-semibold text-white neon-gradient h-full w-full flex items-center justify-center font-orbitron">
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="ml-3 hidden md:block">
            <span className="font-medium text-white font-space-grotesk truncate glow-text">
              {currentUser?.displayName || currentUser?.email}
            </span>
            <div className="flex items-center text-xs text-cyan-200">
              <Satellite size={12} className="mr-1 animate-pulse" />
              <span className="glow-text">Online</span>
              <Zap size={10} className="ml-1" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleSearch}
            className="text-white hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition-all duration-300 neon-glow"
            title="Search Galaxy"
          >
            <Search size={20} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-white hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition-all duration-300"
              title="Menu"
            >
              <MoreVertical size={20} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 galaxy-card rounded-lg shadow-xl z-10 border border-cyan-400/30 neon-glow">
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm text-cyan-200 hover:bg-white/10 flex items-center transition-all duration-300 font-space-grotesk"
                  >
                    <LogOut size={16} className="mr-3" />
                    Exit Galaxy
                    <Sparkles size={12} className="ml-auto" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Search bar */}
      {isSearching ? (
        <UserSearch 
          searchTerm={searchTerm} 
          onSearch={handleSearch} 
          searchResults={searchResults}
          onSelectUser={(userId) => {
            onNewChat(userId);
            setIsSearching(false);
          }}
          onClose={toggleSearch}
        />
      ) : (
        <div className="p-3 bg-slate-900/30 border-b border-cyan-400/20">
          <div className="relative">
            <input
              type="text"
              placeholder="Search across the galaxy..."
              className="w-full p-3 pl-10 pr-12 rounded-xl galaxy-input text-cyan-200 focus:outline-none transition-all duration-300 font-space-grotesk neon-border"
              onClick={toggleSearch}
              readOnly
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              <Zap size={12} className="text-blue-400 animate-pulse" />
            </div>
          </div>
        </div>
      )}
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto bg-slate-900/20">
        <ChatList 
          chats={chats} 
          activeChatId={activeChatId} 
          onChatSelect={setActiveChatId} 
          onStartSearch={toggleSearch}
        />
      </div>
    </div>
  );
};

export default Sidebar;