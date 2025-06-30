import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  listenToMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  reactToMessage,
  Message,
  getChatById
} from '../firebase/chat';
import { getUserById } from '../firebase/users';
import { listenToMusicState, MusicState, getCurrentlyPlayingSong, Song } from '../firebase/music';
import MessageInput from './MessageInput';
import MessageItem from './MessageItem';
import MusicLibrary from './MusicLibrary';
import MusicPlayer from './MusicPlayer';
import { ArrowLeft, MoreVertical, Phone, Video, Sparkles, MessageSquare, Satellite, Zap, Music, Radio } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [geminiSuggestion, setGeminiSuggestion] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  const [musicState, setMusicState] = useState<MusicState | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // Observer for message visibility
  useEffect(() => {
    if (!messageContainerRef.current || !currentUser) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasUnreadMessages) {
            markMessagesAsRead(chatId, currentUser.uid);
            setHasUnreadMessages(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(messageContainerRef.current);
    return () => observer.disconnect();
  }, [chatId, currentUser, hasUnreadMessages]);

  // Listen to music state changes
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = listenToMusicState(chatId, async (state) => {
      setMusicState(state);
      
      // Get current song details if playing
      if (state?.currentSong && state.isPlaying) {
        try {
          const song = await getCurrentlyPlayingSong(chatId);
          setCurrentSong(song);
        } catch (error) {
          console.error('Error getting current song:', error);
        }
      } else {
        setCurrentSong(null);
      }
    });

    return () => unsubscribe();
  }, [chatId]);
  
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadChatData = async () => {
      if (!currentUser || !chatId) {
        setMessages([]);
        setOtherUser(null);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Verify chat access and get chat data
        const chatData = await getChatById(chatId);
        
        if (!chatData || !chatData.participants.includes(currentUser.uid)) {
          setMessages([]);
          setOtherUser(null);
          setIsLoading(false);
          return;
        }
        
        // Find the other participant
        const otherUserId = chatData.participants.find((id: string) => id !== currentUser.uid);
        
        if (otherUserId) {
          const userData = await getUserById(otherUserId);
          setOtherUser(userData);
        }
        
        // Listen to messages
        unsubscribe = listenToMessages(chatId, (messagesData) => {
          setMessages(messagesData);
          
          // Check for unread messages
          const hasUnread = messagesData.some(
            msg => !msg.read && msg.senderId !== currentUser.uid
          );
          setHasUnreadMessages(hasUnread);
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading chat data:", error);
        setMessages([]);
        setOtherUser(null);
        setIsLoading(false);
      }
    };
    
    loadChatData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId, currentUser]);
  
  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (text: string, images: Array<{ name: string; data: ArrayBuffer; type: string }> = []) => {
    if (!currentUser || (!text.trim() && images.length === 0)) return;
    
    try {
      await sendMessage(chatId, currentUser.uid, text, images);
      // Clear Gemini suggestion after sending a message
      setGeminiSuggestion('');
    } catch (error) {
      console.error("Error sending message:", error);
      // Show user-friendly error message
      alert('Failed to send message. Please check your connection and try again.');
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(chatId, messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  
  const handleMessageReaction = async (messageId: string, reaction: string) => {
    if (!currentUser) return;
    
    try {
      await reactToMessage(chatId, messageId, currentUser.uid, reaction);
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  const formatLastSeen = (lastSeen: any) => {
    if (!lastSeen) return 'Offline';
    const date = lastSeen.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If last seen was less than a minute ago
    if (diff < 60000) {
      return 'Just now';
    }
    
    // If last seen was today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${format(date, 'p')}`;
    }
    
    // If last seen was yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${format(date, 'p')}`;
    }
    
    // Otherwise show full date
    return format(date, 'PPp');
  };

  // Function to get Gemini suggestion
  const getGeminiSuggestion = async () => {
    if (messages.length === 0) return;
    
    setIsGeminiLoading(true);
    
    try {
      // Get the last 5 messages or fewer if there aren't 5
      const recentMessages = messages.slice(-5).map(msg => {
        const sender = msg.senderId === currentUser?.uid ? 'You' : otherUser?.displayName || 'Other User';
        return `${sender}: ${msg.text}`;
      });
      
      const apiKey = 'REDACTED';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Based on this conversation, suggest a natural and helpful response. Keep it conversational and friendly. Don't include any instructions or explanations in your response, just provide the suggested reply.\n\nConversation:\n${recentMessages.join('\n')}\n\nSuggested response:`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250
        }
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
        const suggestion = data.candidates[0].content.parts[0].text.trim();
        setGeminiSuggestion(suggestion);
      } else {
        console.error('Unexpected response format from Gemini API:', data);
        setGeminiSuggestion('');
      }
    } catch (error) {
      console.error('Error getting Gemini suggestion:', error);
      setGeminiSuggestion('');
    } finally {
      setIsGeminiLoading(false);
    }
  };
  
  // Function to apply Gemini suggestion
  const applyGeminiSuggestion = () => {
    if (geminiSuggestion) {
      handleSendMessage(geminiSuggestion);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center galaxy-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-6 neon-glow"></div>
          <p className="text-cyan-300 font-space-grotesk text-lg glow-text">Connecting to the cosmos...</p>
          <div className="flex justify-center mt-4 space-x-2">
            <Zap size={16} className="text-cyan-400 animate-pulse" />
            <Sparkles size={16} className="text-blue-400 animate-pulse" />
            <Zap size={16} className="text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center galaxy-bg">
        <div className="text-center p-4">
          <p className="text-cyan-300 font-space-grotesk">Please log in to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat header */}
      <div className="neon-gradient px-4 py-3 flex items-center justify-between border-l border-cyan-400/30 shadow-lg hologram-effect">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="md:hidden text-white mr-3 p-2 rounded-full hover:bg-white/10 transition-all duration-300 neon-glow"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full galaxy-card overflow-hidden pulse-glow border-2 border-cyan-400/50">
              {otherUser?.photoURL ? (
                <img src={otherUser.photoURL} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="neon-gradient h-full w-full flex items-center justify-center text-white font-semibold text-lg font-orbitron">
                  {otherUser?.displayName?.charAt(0) || otherUser?.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            
            <div className="ml-3">
              <h2 className="font-medium text-white font-space-grotesk glow-text">
                {otherUser?.displayName || otherUser?.email || 'Cosmic Traveler'}
              </h2>
              <div className="flex items-center text-xs text-cyan-200">
                <Satellite size={12} className="mr-1 animate-pulse" />
                <span className="font-space-grotesk glow-text">
                  {otherUser?.isOnline ? 'Online' : formatLastSeen(otherUser?.lastSeen)}
                </span>
                <Zap size={10} className="ml-1" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Music Library Button */}
          <button 
            onClick={() => setShowMusicLibrary(true)}
            className={`text-white hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition-all duration-300 neon-glow ${
              musicState?.isPlaying ? 'animate-pulse' : ''
            }`}
            title="Cosmic Music Library"
          >
            {musicState?.isPlaying ? <Radio size={20} /> : <Music size={20} />}
          </button>
          
          <button className="text-white hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition-all duration-300 neon-glow">
            <Video size={20} />
          </button>
          <button className="text-white hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition-all duration-300 neon-glow">
            <Phone size={20} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-white hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              <MoreVertical size={20} />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 galaxy-card rounded-lg shadow-xl z-10 border border-cyan-400/30 neon-glow">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setShowMusicLibrary(true);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-cyan-300 hover:bg-white/10 transition-all duration-300 font-space-grotesk flex items-center"
                  >
                    <Music size={16} className="mr-3" />
                    Cosmic Music Library
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm text-cyan-300 hover:bg-white/10 transition-all duration-300 font-space-grotesk">
                    View cosmic profile
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm text-cyan-300 hover:bg-white/10 transition-all duration-300 font-space-grotesk">
                    Clear message history
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Music Status Bar */}
      {musicState?.isPlaying && currentSong && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 border-b border-cyan-400/20 flex items-center justify-between">
          <div className="flex items-center">
            <Radio size={16} className="text-cyan-400 mr-2 animate-pulse" />
            <span className="text-cyan-200 font-space-grotesk text-sm">
              🎵 Now playing: {currentSong.title}
            </span>
          </div>
          <button
            onClick={() => setShowMusicLibrary(true)}
            className="text-cyan-400 hover:text-cyan-200 text-sm font-space-grotesk hover:underline"
          >
            View Library
          </button>
        </div>
      )}
      
      {/* Messages area */}
      <div 
        ref={messageContainerRef}
        className="flex-1 p-4 overflow-y-auto galaxy-bg relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-cyan-400">
            <div className="galaxy-card p-8 rounded-lg text-center floating-animation neon-glow">
              <div className="neon-gradient p-6 rounded-full inline-block mb-6 pulse-glow">
                <MessageSquare className="text-white" size={36} />
              </div>
              <p className="text-xl font-medium mb-3 text-white font-orbitron glow-text">No cosmic messages yet</p>
              <p className="text-sm font-space-grotesk text-cyan-300 mb-4">Send a message to start your interstellar conversation!</p>
              <button
                onClick={() => setShowMusicLibrary(true)}
                className="cosmic-button text-white px-4 py-2 rounded-lg transition-all duration-300 font-space-grotesk flex items-center mx-auto"
              >
                <Music size={16} className="mr-2" />
                Add Cosmic Music
              </button>
              <div className="flex justify-center mt-4 space-x-2">
                <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                <Zap size={16} className="text-blue-400 animate-pulse" />
                <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser?.uid}
                onDelete={() => handleDeleteMessage(message.id)}
                onReaction={(reaction) => handleMessageReaction(message.id, reaction)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Gemini suggestion section */}
      {geminiSuggestion && (
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 border-t border-cyan-400/20 flex items-center backdrop-blur-sm neon-glow">
          <div className="flex-1 text-sm text-cyan-200 pr-2 overflow-hidden">
            <div className="flex items-center mb-1">
              <Zap size={16} className="text-cyan-400 mr-2 animate-pulse" />
              <span className="text-xs text-cyan-300 font-medium font-space-grotesk glow-text">AI Cosmic Suggestion</span>
            </div>
            <p className="truncate font-space-grotesk">{geminiSuggestion}</p>
          </div>
          <button 
            onClick={applyGeminiSuggestion}
            className="px-4 py-2 cosmic-button text-white text-sm rounded-lg transition-all duration-300 font-space-grotesk"
          >
            Use
          </button>
        </div>
      )}

      {/* Music Player */}
      {currentSong && (
        <MusicPlayer
          currentSong={currentSong}
          isPlaying={musicState?.isPlaying || false}
          onPlayPause={() => {
            // This will be handled by the music library for now
            setShowMusicLibrary(true);
          }}
        />
      )}
      
      {/* Message input */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        geminiAction={
          <button 
            onClick={getGeminiSuggestion}
            disabled={isGeminiLoading || messages.length === 0}
            className={`p-2 rounded-full transition-all duration-300 ${
              isGeminiLoading ? 'text-slate-500' : 'text-cyan-400 hover:bg-white/10 neon-glow'
            }`}
            title="Get AI cosmic suggestion"
          >
            {isGeminiLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full" />
            ) : (
              <Sparkles size={20} />
            )}
          </button>
        }
        musicAction={
          <button 
            onClick={() => setShowMusicLibrary(true)}
            className={`p-2 rounded-full transition-all duration-300 ${
              musicState?.isPlaying 
                ? 'text-purple-400 hover:bg-white/10 neon-glow animate-pulse' 
                : 'text-cyan-400 hover:bg-white/10 neon-glow'
            }`}
            title="Cosmic Music Library"
          >
            {musicState?.isPlaying ? <Radio size={20} /> : <Music size={20} />}
          </button>
        }
      />

      {/* Music Library Modal */}
      <MusicLibrary
        chatId={chatId}
        isOpen={showMusicLibrary}
        onClose={() => setShowMusicLibrary(false)}
      />
    </div>
  );
};

export default ChatWindow;