import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, Rocket, AlertCircle } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string, images?: Array<{ name: string; data: ArrayBuffer; type: string }>) => void;
  geminiAction?: React.ReactNode;
  musicAction?: React.ReactNode;
}

const emojiCategories = [
  {
    name: 'Cosmic',
    emojis: ['🌟', '⭐', '✨', '🌙', '🌞', '🪐', '🌌', '🚀', '🛸', '👽', '🌠', '☄️', '🌕', '🌖']
  },
  {
    name: 'Emotions',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌']
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👊', '👋', '🤚', '🖐️', '✋', '👏', '🙌']
  },
  {
    name: 'Music',
    emojis: ['🎵', '🎶', '🎤', '🎧', '🎼', '🎹', '🥁', '🎸', '🎺', '🎷', '🎻', '📻', '🔊', '🔉']
  }
];

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage,
  geminiAction,
  musicAction
}) => {
  const [message, setMessage] = useState('');
  const [filePreviews, setFilePreviews] = useState<Array<{ 
    preview: string; 
    name: string;
    type: string;
    size: number;
  }>>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`;
    }
  }, [message]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node) && 
          event.target instanceof Element && !event.target.closest('button')?.classList.contains('emoji-button')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      filePreviews.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, [filePreviews]);

  // Clear upload error after 5 seconds
  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  const handleSend = async () => {
    if ((!message.trim() && filePreviews.length === 0) || isUploading) return;
    
    setIsUploading(true);
    setUploadError('');

    try {
      // Convert file previews to bytes
      const imageData = await Promise.all(
        filePreviews.map(async ({ preview, name, type }) => {
          const response = await fetch(preview);
          const buffer = await response.arrayBuffer();
          return { name, data: buffer, type };
        })
      );

      await onSendMessage(message, imageData.length > 0 ? imageData : undefined);
      
      // Clear form on successful send
      setMessage('');
      setFilePreviews([]);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isUploading) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter(file => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          setUploadError('Only image files are allowed');
          return false;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setUploadError('File size must be less than 10MB');
          return false;
        }
        
        return true;
      });

      if (validFiles.length > 0) {
        const newFiles = validFiles.map(file => ({
          preview: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size
        }));
        
        setFilePreviews(prev => [...prev, ...newFiles]);
        setUploadError('');
      }
      
      e.target.value = '';
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => {
      const textarea = textareaRef.current;
      const cursorPosition = textarea?.selectionStart || prev.length;
      const textBeforeCursor = prev.substring(0, cursorPosition);
      const textAfterCursor = prev.substring(cursorPosition);
      
      return textBeforeCursor + emoji + textAfterCursor;
    });
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  const removeFile = (index: number) => {
    const newPreviews = [...filePreviews];
    URL.revokeObjectURL(newPreviews[index].preview);
    newPreviews.splice(index, 1);
    setFilePreviews(newPreviews);
  };

  // Format file size to human readable format
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-3 border-t border-white/20">
      {/* Upload Error */}
      {uploadError && (
        <div className="mb-3 bg-red-500/20 border border-red-400/50 text-red-300 px-4 py-3 rounded-xl flex items-center">
          <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          <span className="font-space-grotesk text-sm">{uploadError}</span>
          <button 
            onClick={() => setUploadError('')}
            className="ml-auto text-red-300 hover:text-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* File previews */}
      {filePreviews.length > 0 && (
        <div className="mb-3 space-y-2">
          {filePreviews.map((file, index) => (
            <div key={index} className="flex items-center p-3 galaxy-card rounded-lg">
              <div className="relative">
                <img 
                  src={file.preview} 
                  alt={`Preview ${file.name}`} 
                  className="h-16 w-16 object-cover rounded-lg" 
                />
                <button 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  onClick={() => removeFile(index)}
                  title="Remove file"
                  disabled={isUploading}
                >
                  <X size={12} />
                </button>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-slate-200 truncate font-space-grotesk">{file.name}</p>
                <p className="text-xs text-slate-400 font-space-grotesk">{formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end space-x-2">
        <div className="flex items-center space-x-1">
          <button 
            className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/10 transition-all duration-300"
            onClick={() => fileInputRef.current?.click()}
            title="Attach cosmic files"
            disabled={isUploading}
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          <button 
            className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/10 transition-all duration-300 emoji-button"
            onClick={toggleEmojiPicker}
            title="Add cosmic emoji"
            disabled={isUploading}
          >
            <Smile size={20} />
          </button>
          
          {geminiAction}
          {musicAction}
        </div>
        
        <div className="flex-1 galaxy-card rounded-2xl overflow-hidden flex items-end relative">
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-full mb-2 galaxy-card rounded-lg p-3 border border-white/20 z-10"
              style={{ width: '320px', maxHeight: '280px', overflowY: 'auto' }}
            >
              <div className="mb-2 pb-2 border-b border-white/20">
                <h3 className="text-sm font-medium text-slate-200 font-space-grotesk">Cosmic Emojis</h3>
              </div>
              <div className="space-y-3">
                {emojiCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h4 className="text-xs text-slate-400 mb-2 font-medium font-space-grotesk">{category.name}</h4>
                    <div className="grid grid-cols-8 gap-1">
                      {category.emojis.map((emoji, emojiIndex) => (
                        <button
                          key={emojiIndex}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-lg transition-colors"
                          onClick={() => insertEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 py-3 px-4 resize-none focus:outline-none text-slate-200 placeholder-slate-500 bg-transparent font-space-grotesk"
            placeholder={isUploading ? "Sending to the cosmos..." : "Type your cosmic message..."}
            rows={1}
            style={{ maxHeight: '96px' }}
            disabled={isUploading}
          />
          
          <button
            onClick={handleSend}
            disabled={(!message.trim() && filePreviews.length === 0) || isUploading}
            className={`p-3 rounded-full transition-all duration-300 ${
              (!message.trim() && filePreviews.length === 0) || isUploading
                ? 'text-slate-500' 
                : 'text-blue-400 hover:bg-white/10 cosmic-button'
            }`}
            title={isUploading ? "Sending..." : "Send to the cosmos"}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;