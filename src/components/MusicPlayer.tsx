import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Music,
  Minimize2,
  Maximize2,
  Radio,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Song } from '../firebase/music';

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  className = ''
}) => {
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showYouTubeNotice, setShowYouTubeNotice] = useState(true);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className={`galaxy-card border-t border-cyan-400/30 transition-all duration-300 ${className} ${
      isMinimized ? 'h-16' : 'h-auto'
    }`}>
      {/* YouTube Notice */}
      {showYouTubeNotice && !isMinimized && (
        <div className="bg-blue-500/20 border-b border-blue-400/30 p-3 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle size={16} className="text-blue-400 mr-2" />
            <span className="text-blue-200 font-space-grotesk text-sm">
              🎵 Music is shared! Click the YouTube button to play the actual audio.
            </span>
          </div>
          <button
            onClick={() => setShowYouTubeNotice(false)}
            className="text-blue-300 hover:text-blue-100 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="p-4 flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="relative mr-4 flex-shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img
                src={`https://img.youtube.com/vi/${currentSong.videoId}/mqdefault.jpg`}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                      <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                    </div>
                  `;
                }}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Radio size={16} className="text-cyan-400 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {!isMinimized && (
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium font-space-grotesk text-sm truncate">
                {currentSong.title}
              </h4>
              <div className="flex items-center text-cyan-400 text-xs font-space-grotesk">
                <Music size={12} className="mr-1" />
                <span>Added by {currentSong.addedByName}</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {!isMinimized && onPrevious && (
            <button
              onClick={onPrevious}
              className="text-cyan-400 hover:text-cyan-200 p-1 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              <SkipBack size={16} />
            </button>
          )}

          <button
            onClick={onPlayPause}
            className="cosmic-button p-2 rounded-full text-white hover:scale-110 transition-all duration-300"
            title={isPlaying ? "Pause shared music" : "Play shared music"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {!isMinimized && onNext && (
            <button
              onClick={onNext}
              className="text-cyan-400 hover:text-cyan-200 p-1 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              <SkipForward size={16} />
            </button>
          )}

          {!isMinimized && (
            <>
              <button
                onClick={toggleMute}
                className="text-cyan-400 hover:text-cyan-200 p-1 rounded-full hover:bg-white/10 transition-all duration-300"
                title="Volume control (visual only)"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-cyan-400/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #00d4ff 0%, #00d4ff ${(isMuted ? 0 : volume) * 100}%, rgba(0, 212, 255, 0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(0, 212, 255, 0.3) 100%)`
                }}
                title="Volume control (visual only)"
              />
            </>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-cyan-400 hover:text-cyan-200 p-1 rounded-full hover:bg-white/10 transition-all duration-300"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>

          {/* YouTube Link */}
          <button
            onClick={() => window.open(currentSong.url, '_blank')}
            className="cosmic-button text-white p-2 rounded-full hover:scale-110 transition-all duration-300"
            title="Play on YouTube"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Info Bar (only when not minimized) */}
      {!isMinimized && (
        <div className="px-4 pb-3">
          <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-3">
            <div className="flex items-center justify-between text-sm text-cyan-300 font-space-grotesk">
              <div className="flex items-center">
                <Radio size={14} className="mr-2 animate-pulse" />
                <span>Shared music experience</span>
              </div>
              <div className="flex items-center">
                <ExternalLink size={14} className="mr-2" />
                <span>Click to play on YouTube</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;