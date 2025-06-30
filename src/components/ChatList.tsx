import React from 'react';
import { format } from 'date-fns';
import { Search, MessageSquare, Users, Star, Zap } from 'lucide-react';

interface User {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  isOnline?: boolean;
}

interface Message {
  text: string;
  createdAt: any;
  senderId?: string;
  read?: boolean;
}

interface Chat {
  id: string;
  user: User;
  lastMessage?: Message;
  unreadCount?: number;
}

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onStartSearch?: () => void;
  className?: string;
}

const ChatList: React.FC<ChatListProps> = ({ 
  chats, 
  activeChatId, 
  onChatSelect, 
  onStartSearch,
  className = ''
}) => {
  // Safe timestamp formatting function
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return '';
    
    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'p');
      }
      
      // Handle Date object
      if (timestamp instanceof Date) {
        return format(timestamp, 'p');
      }
      
      // Handle timestamp number
      if (typeof timestamp === 'number') {
        return format(new Date(timestamp), 'p');
      }
      
      // Handle string timestamp
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return format(date, 'p');
        }
      }
      
      return '';
    } catch (error) {
      console.warn('Error formatting timestamp:', error);
      return '';
    }
  };

  if (chats.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-6 text-center ${className}`}>
        <div className="cosmic-gradient p-6 rounded-full mb-4 pulse-glow floating-animation">
          <Users className="text-white" size={32} />
        </div>
        <h3 className="text-lg font-medium text-white mb-2 font-orbitron">No cosmic connections yet</h3>
        <p className="text-slate-400 mb-6 max-w-xs font-space-grotesk">
          Start your interstellar journey by finding fellow space travelers
        </p>
        <button 
          className="flex items-center justify-center cosmic-button text-white px-4 py-2 rounded-lg transition-all duration-300 font-space-grotesk"
          onClick={onStartSearch}
        >
          <Search className="mr-2" size={18} />
          Explore Galaxy
        </button>
      </div>
    );
  }

  return (
    <div className={`divide-y divide-white/10 overflow-y-auto h-full ${className}`}>
      {chats.map((chat) => {
        const hasUnread = chat.unreadCount && chat.unreadCount > 0;
        const isActive = activeChatId === chat.id;
        
        return (
          <div
            key={chat.id}
            className={`p-4 flex items-center hover:bg-white/5 cursor-pointer transition-all duration-300 ${
              isActive ? 'bg-white/10 border-r-2 border-blue-400' : hasUnread ? 'bg-purple-500/10' : ''
            }`}
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="relative h-12 w-12 rounded-full flex-shrink-0 overflow-hidden">
              {chat.user.photoURL ? (
                <img 
                  src={chat.user.photoURL} 
                  alt="Profile" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="cosmic-gradient h-full w-full flex items-center justify-center text-white font-semibold text-xl font-orbitron">
                  {chat.user.displayName?.charAt(0) || chat.user.email?.charAt(0) || 'U'}
                </div>
              )}
              {chat.user.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-slate-900 pulse-glow"></div>
              )}
            </div>
            
            <div className="ml-3 flex-1 overflow-hidden min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className={`text-slate-200 truncate font-space-grotesk ${
                  hasUnread ? 'font-bold' : 'font-medium'
                }`}>
                  {chat.user.displayName || chat.user.email}
                </h3>
                {chat.lastMessage?.createdAt && (
                  <span className={`text-xs whitespace-nowrap ml-2 font-space-grotesk ${
                    hasUnread ? 'text-blue-400 font-semibold' : 'text-slate-500'
                  }`}>
                    {formatTimestamp(chat.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className={`truncate text-sm font-space-grotesk ${
                  hasUnread 
                    ? 'text-slate-200 font-semibold' 
                    : 'text-slate-400'
                }`}>
                  {chat.lastMessage?.text || "No messages yet"}
                </p>
                
                {hasUnread && (
                  <div className="ml-2 flex-shrink-0 cosmic-gradient text-white text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center pulse-glow">
                    {chat.unreadCount! > 9 ? '9+' : chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;