import React from 'react';
import { User } from '../firebase/users';
import { X, Search, UserPlus, Sparkles } from 'lucide-react';

interface UserSearchProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  searchResults: User[];
  onSelectUser: (userId: string) => void;
  onClose: () => void;
}

const UserSearch: React.FC<UserSearchProps> = ({
  searchTerm,
  onSearch,
  searchResults,
  onSelectUser,
  onClose
}) => {
  return (
    <div className="galaxy-card border-b border-white/20 backdrop-blur-xl">
      <div className="p-3 flex items-center cosmic-gradient">
        <button 
          onClick={onClose} 
          className="p-2 text-white hover:text-blue-200 hover:bg-white/10 rounded-full transition-all duration-300"
        >
          <X size={20} />
        </button>
        <input
          type="text"
          placeholder="Search cosmic travelers..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 p-2 ml-3 bg-transparent border-none focus:outline-none text-white placeholder-blue-200 font-space-grotesk"
          autoFocus
        />
        <Search size={20} className="text-blue-200 mr-2" />
      </div>
      
      <div className="max-h-96 overflow-y-auto bg-slate-900/30">
        {searchResults.length > 0 ? (
          <div className="divide-y divide-white/10">
            {searchResults.map((user) => (
              <div
                key={user.uid}
                className="p-4 flex items-center hover:bg-white/5 cursor-pointer transition-all duration-300"
                onClick={() => onSelectUser(user.uid)}
              >
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full flex-shrink-0 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="cosmic-gradient h-full w-full flex items-center justify-center text-white font-semibold text-xl font-orbitron">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                
                {/* User info */}
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="text-slate-200 font-medium truncate font-space-grotesk">
                      {user.displayName || user.email}
                    </h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectUser(user.uid);
                      }}
                      className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-white/10 transition-all duration-300"
                    >
                      <UserPlus size={18} />
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm truncate font-space-grotesk">
                    {user.status || "Exploring the cosmic void..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="p-6 text-center text-slate-400">
            <Search className="mx-auto mb-2 text-slate-500" size={24} />
            <p className="font-space-grotesk">No cosmic travelers found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400">
            <div className="cosmic-gradient p-3 rounded-full inline-block mb-3">
              <Sparkles className="text-white" size={24} />
            </div>
            <p className="font-space-grotesk">Search for fellow space explorers</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;