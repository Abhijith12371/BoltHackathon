import React, { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Trash2, Heart, ThumbsUp, Smile, Star, Zap } from 'lucide-react';
import MessageStatus from './MessageStatus';

interface MessageItemProps {
  message: {
    id: string;
    text: string;
    senderId: string;
    createdAt: any; // Firebase timestamp
    images?: string[];
    reactions?: {
      [userId: string]: string;
    };
    read?: boolean;
  };
  isOwn: boolean;
  onDelete: () => void;
  onReaction: (reaction: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, onDelete, onReaction }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  const reactions = message.reactions || {};
  const reactionCount = Object.keys(reactions).length;
  const reactionTypes = [...new Set(Object.values(reactions))];
  
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return format(date, 'p'); // 'p' formats to something like '12:00 PM'
  };
  
  // Group reactions by type for display
  const reactionSummary = reactionTypes.map(type => {
    const count = Object.values(reactions).filter(r => r === type).length;
    return { type, count };
  });

  const handleReactionClick = (reaction: string) => {
    onReaction(reaction);
    setShowReactions(false);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} relative group`}>
      <div 
        className={`relative max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
          isOwn 
            ? 'message-bubble-own rounded-br-md' 
            : 'message-bubble-other rounded-bl-md'
        }`}
      >
        {/* Message content */}
        <div>
          {message.text && (
            <p className={`whitespace-pre-wrap break-words leading-relaxed font-space-grotesk ${
              isOwn ? 'text-white' : 'text-slate-200'
            }`}>
              {message.text}
            </p>
          )}
          
          {message.images && message.images.length > 0 && (
            <div className={`mt-2 ${message.images.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
              {message.images.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt="Attachment" 
                  className="max-h-60 rounded-lg cursor-pointer object-cover w-full shadow-md" 
                />
              ))}
            </div>
          )}
          
          {/* Timestamp and status */}
          <div className="flex items-center justify-end mt-2 space-x-1">
            <span className={`text-xs font-space-grotesk ${
              isOwn ? 'text-blue-100' : 'text-slate-400'
            }`}>
              {formatMessageTime(message.createdAt)}
            </span>
            {isOwn && <MessageStatus isRead={message.read || false} />}
          </div>
        </div>
        
        {/* Reactions display */}
        {reactionCount > 0 && (
          <div className={`absolute ${isOwn ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} -bottom-3 galaxy-card rounded-full px-2 py-1 shadow-md text-xs flex items-center border border-white/20`}>
            {reactionSummary.map((r, idx) => (
              <div key={idx} className="flex items-center mr-1 last:mr-0">
                <span>{r.type}</span>
                {r.count > 1 && <span className="ml-1 text-slate-400">{r.count}</span>}
              </div>
            ))}
          </div>
        )}
        
        {/* Message options - visible on hover */}
        <div className={`absolute ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <div className="flex items-center galaxy-card rounded-full shadow-md border border-white/20">
            {/* Reaction button */}
            <button 
              onClick={() => setShowReactions(!showReactions)}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Smile size={16} />
            </button>
            
            {/* More options button */}
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
        
        {/* Options dropdown */}
        {showOptions && (
          <div className={`absolute ${isOwn ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full mr-2'} top-0 galaxy-card rounded-lg shadow-lg z-10 border border-white/20`}>
            <div className="py-1">
              {isOwn && (
                <button
                  onClick={() => {
                    onDelete();
                    setShowOptions(false);
                  }}
                  className="flex items-center px-4 py-3 text-sm text-red-400 hover:bg-white/10 w-full text-left transition-colors font-space-grotesk"
                >
                  <Trash2 size={16} className="mr-3" />
                  Delete from cosmos
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Reactions dropdown */}
        {showReactions && (
          <div className={`absolute ${isOwn ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full mr-2'} top-0 galaxy-card rounded-full shadow-lg z-10 flex p-1 border border-white/20`}>
            <button 
              onClick={() => handleReactionClick('❤️')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Heart size={16} className="text-red-400" />
            </button>
            <button 
              onClick={() => handleReactionClick('👍')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ThumbsUp size={16} className="text-blue-400" />
            </button>
            <button 
              onClick={() => handleReactionClick('⭐')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Star size={16} className="text-yellow-400" />
            </button>
            <button 
              onClick={() => handleReactionClick('🚀')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-lg"
            >
              🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;