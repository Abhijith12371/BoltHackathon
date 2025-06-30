import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  addSongToChat, 
  listenToChatSongs, 
  playSongForChat, 
  pauseSongForChat,
  extractYouTubeId,
  fetchYouTubeTitle,
  Song 
} from '../firebase/music';
import { 
  Music, 
  Plus, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X, 
  Youtube, 
  Headphones,
  Radio,
  Disc3,
  Heart,
  Share2,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

interface MusicLibraryProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({ chatId, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [newSongUrl, setNewSongUrl] = useState('');
  const [newSongTitle, setNewSongTitle] = useState('');
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);

  // Listen to songs in the chat with error handling
  useEffect(() => {
    if (!chatId) return;

    try {
      const unsubscribe = listenToChatSongs(chatId, (songsData) => {
        setSongs(songsData);
        setError(''); // Clear any previous errors
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up songs listener:', error);
      setError('Failed to load songs. Please try refreshing.');
    }
  }, [chatId]);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Validate and fetch YouTube video info when URL changes
  useEffect(() => {
    const validateUrl = async () => {
      if (!newSongUrl.trim()) {
        setNewSongTitle('');
        return;
      }

      const videoId = extractYouTubeId(newSongUrl);
      if (!videoId) {
        setNewSongTitle('');
        setError('Please enter a valid YouTube URL');
        return;
      }

      setIsValidatingUrl(true);
      setError('');

      try {
        const title = await fetchYouTubeTitle(videoId);
        setNewSongTitle(title);
        setError('');
      } catch (error) {
        console.error('Error fetching video title:', error);
        setNewSongTitle(`YouTube Video ${videoId.substring(0, 8)}`);
        setError('Could not fetch video title, but you can still add it');
      } finally {
        setIsValidatingUrl(false);
      }
    };

    const debounceTimer = setTimeout(validateUrl, 500);
    return () => clearTimeout(debounceTimer);
  }, [newSongUrl]);

  const handleAddSong = async () => {
    if (!newSongUrl.trim() || !currentUser) return;

    const videoId = extractYouTubeId(newSongUrl);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    // Check if song already exists
    const existingSong = songs.find(song => song.videoId === videoId);
    if (existingSong) {
      setError('This song is already in the library!');
      return;
    }

    setIsAddingSong(true);
    setError('');

    try {
      const title = newSongTitle || await fetchYouTubeTitle(videoId);
      
      await addSongToChat(chatId, {
        title,
        url: newSongUrl,
        videoId,
        addedBy: currentUser.uid,
        addedByName: currentUser.displayName || currentUser.email || 'Unknown User'
      });

      setNewSongUrl('');
      setNewSongTitle('');
      setShowAddForm(false);
      setSuccess('Song added successfully! 🎵');
    } catch (error) {
      console.error('Error adding song:', error);
      setError('Failed to add song. Please try again.');
    } finally {
      setIsAddingSong(false);
    }
  };

  const handlePlaySong = async (song: Song) => {
    if (!currentUser) return;

    try {
      setError('');
      
      if (currentlyPlaying === song.id && isPlaying) {
        // Pause current song
        await pauseSongForChat(chatId, currentUser.uid);
        setIsPlaying(false);
        setCurrentlyPlaying(null);
        setCurrentSong(null);
      } else {
        // Play new song
        await playSongForChat(chatId, song.id, currentUser.uid);
        setCurrentlyPlaying(song.id);
        setCurrentSong(song);
        setIsPlaying(true);
        setSuccess(`Now playing: ${song.title} 🎵`);
      }
    } catch (error) {
      console.error('Error controlling song playback:', error);
      setError('Failed to control playback. Please try again.');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setNewSongUrl('');
    setNewSongTitle('');
    setError('');
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="galaxy-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden neon-glow">
        {/* Header */}
        <div className="neon-gradient p-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 cosmic-gradient rounded-full flex items-center justify-center mr-4 pulse-glow">
              <Music size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-orbitron glow-text">Cosmic Music Library</h2>
              <p className="text-cyan-200 font-space-grotesk">Shared songs for this galaxy chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Status Messages */}
        {(error || success) && (
          <div className="px-6 py-3">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-300 px-4 py-3 rounded-xl flex items-center">
                <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                <span className="font-space-grotesk">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 border border-green-400/50 text-green-300 px-4 py-3 rounded-xl flex items-center">
                <CheckCircle size={20} className="mr-3 flex-shrink-0" />
                <span className="font-space-grotesk">{success}</span>
              </div>
            )}
          </div>
        )}

        {/* Current Playing */}
        {currentSong && (
          <div className="p-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 cosmic-gradient rounded-xl flex items-center justify-center mr-4 pulse-glow">
                  <Disc3 size={24} className="text-white animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <h3 className="text-white font-semibold font-space-grotesk text-lg">Now Playing</h3>
                  <p className="text-cyan-200 font-space-grotesk">{currentSong.title}</p>
                  <p className="text-cyan-400 text-sm font-space-grotesk">Added by {currentSong.addedByName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handlePlaySong(currentSong)}
                  className="cosmic-button p-3 rounded-full text-white hover:scale-110 transition-all duration-300"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-cyan-400 hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Song Section */}
        <div className="p-6 border-b border-cyan-400/20">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full cosmic-button text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 font-space-grotesk flex items-center justify-center hover:scale-105"
            >
              <Plus size={20} className="mr-3" />
              <Youtube size={20} className="mr-3 text-red-400" />
              Add YouTube Song to Galaxy
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Youtube size={24} className="text-red-400 mr-3" />
                <h3 className="text-white font-semibold font-space-grotesk text-lg">Add New Cosmic Track</h3>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="url"
                    value={newSongUrl}
                    onChange={(e) => setNewSongUrl(e.target.value)}
                    placeholder="Paste YouTube URL here... (e.g., https://www.youtube.com/watch?v=...)"
                    className="w-full galaxy-input rounded-xl p-4 font-space-grotesk pr-12"
                    disabled={isAddingSong}
                  />
                  {isValidatingUrl && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Loader size={20} className="text-cyan-400 animate-spin" />
                    </div>
                  )}
                </div>
                
                {newSongTitle && (
                  <div className="galaxy-card p-4 rounded-xl">
                    <div className="flex items-center">
                      <CheckCircle size={20} className="text-green-400 mr-3" />
                      <div>
                        <p className="text-white font-space-grotesk font-medium">Video Found:</p>
                        <p className="text-cyan-200 font-space-grotesk">{newSongTitle}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddSong}
                    disabled={isAddingSong || !newSongUrl.trim() || isValidatingUrl}
                    className="cosmic-button text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-space-grotesk flex items-center"
                  >
                    {isAddingSong ? (
                      <>
                        <Loader size={20} className="mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={20} className="mr-2" />
                        Add Song
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCloseForm}
                    disabled={isAddingSong}
                    className="galaxy-card text-cyan-200 px-6 py-4 rounded-xl font-medium hover:bg-white/10 transition-all duration-300 font-space-grotesk"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-4">
                <p className="text-cyan-300 text-sm font-space-grotesk mb-2">
                  💡 <strong>How to add songs:</strong>
                </p>
                <ul className="text-cyan-400 text-sm font-space-grotesk space-y-1">
                  <li>• Go to YouTube and find a song you like</li>
                  <li>• Copy the video URL from your browser</li>
                  <li>• Paste it here and we'll automatically fetch the title</li>
                  <li>• Click "Add Song" to share it with everyone in the chat!</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {songs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="cosmic-gradient p-8 rounded-full inline-block mb-6 pulse-glow">
                <Headphones size={48} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 font-orbitron">No cosmic tracks yet</h3>
              <p className="text-cyan-400 font-space-grotesk mb-6">
                Add some YouTube songs to start your shared music journey across the galaxy!
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="cosmic-button text-white px-6 py-3 rounded-xl font-space-grotesk flex items-center mx-auto"
              >
                <Plus size={20} className="mr-2" />
                Add First Song
              </button>
            </div>
          ) : (
            <div className="divide-y divide-cyan-400/20">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`p-6 hover:bg-white/5 transition-all duration-300 ${
                    currentlyPlaying === song.id ? 'bg-cyan-400/10 border-l-4 border-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="relative mr-4">
                        <div className={`w-16 h-16 rounded-xl overflow-hidden ${
                          currentlyPlaying === song.id ? 'pulse-glow' : ''
                        }`}>
                          <img
                            src={`https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if thumbnail fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                          {currentlyPlaying === song.id && isPlaying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Radio size={20} className="text-cyan-400 animate-pulse" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium font-space-grotesk text-lg truncate">
                          {song.title}
                        </h4>
                        <div className="flex items-center text-cyan-400 text-sm font-space-grotesk mt-1">
                          <Users size={14} className="mr-1" />
                          <span>Added by {song.addedByName}</span>
                          <Clock size={14} className="ml-4 mr-1" />
                          <span>{new Date(song.addedAt.toDate()).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="flex items-center text-cyan-300 text-sm">
                            <Youtube size={14} className="mr-1 text-red-400" />
                            <span>YouTube</span>
                          </div>
                          {song.playCount && song.playCount > 0 && (
                            <div className="flex items-center text-cyan-300 text-sm">
                              <Play size={14} className="mr-1" />
                              <span>{song.playCount} plays</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <button
                        onClick={() => handlePlaySong(song)}
                        className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                          currentlyPlaying === song.id && isPlaying
                            ? 'cosmic-button text-white'
                            : 'galaxy-card text-cyan-400 hover:bg-white/10'
                        }`}
                      >
                        {currentlyPlaying === song.id && isPlaying ? (
                          <Pause size={20} />
                        ) : (
                          <Play size={20} />
                        )}
                      </button>
                      
                      <button
                        onClick={() => window.open(song.url, '_blank')}
                        className="text-cyan-400 hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition-all duration-300"
                        title="Open in YouTube"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900/30 border-t border-cyan-400/20">
          <div className="flex items-center justify-between text-cyan-300 font-space-grotesk">
            <div className="flex items-center">
              <Music size={16} className="mr-2" />
              <span>{songs.length} cosmic tracks</span>
            </div>
            <div className="flex items-center">
              <Heart size={16} className="mr-2 text-red-400" />
              <span>Shared music experience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicLibrary;