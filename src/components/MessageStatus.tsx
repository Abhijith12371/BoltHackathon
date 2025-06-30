import React from 'react';
import { Check } from 'lucide-react';

interface MessageStatusProps {
  isRead: boolean;
  className?: string;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ isRead, className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Check 
        size={14} 
        className={`${isRead ? 'text-blue-300' : 'text-blue-100'}`} 
        strokeWidth={2.5}
      />
      <Check 
        size={14} 
        className={`-ml-2 ${isRead ? 'text-blue-300' : 'text-blue-100'}`}
        strokeWidth={2.5}
      />
    </div>
  );
};

export default MessageStatus;