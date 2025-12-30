import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Play, Pause, SkipBack, SkipForward, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SpotifyTrack {
  id: string;
  url: string;
  type: 'track' | 'playlist' | 'album';
}

export function SpotifyMiniPlayer() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>(() => {
    const saved = localStorage.getItem('focusos-spotify');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTrack, setActiveTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');

  const saveTracks = (updatedTracks: SpotifyTrack[]) => {
    setTracks(updatedTracks);
    localStorage.setItem('focusos-spotify', JSON.stringify(updatedTracks));
  };

  const extractSpotifyId = (url: string): { id: string; type: 'track' | 'playlist' | 'album' } | null => {
    try {
      let type: 'track' | 'playlist' | 'album' = 'track';
      let id = '';

      if (url.includes('spotify.com')) {
        const urlParts = url.split('/');
        const typeIndex = urlParts.findIndex(p => ['track', 'playlist', 'album'].includes(p));
        if (typeIndex !== -1) {
          type = urlParts[typeIndex] as 'track' | 'playlist' | 'album';
          id = urlParts[typeIndex + 1]?.split('?')[0] || '';
        }
      } else if (url.startsWith('spotify:')) {
        const parts = url.split(':');
        if (parts.length >= 3) {
          type = parts[1] as 'track' | 'playlist' | 'album';
          id = parts[2];
        }
      }

      return id ? { id, type } : null;
    } catch {
      return null;
    }
  };

  const handleAddTrack = () => {
    const extracted = extractSpotifyId(newUrl);
    if (!extracted) return;

    const newTrack: SpotifyTrack = {
      id: extracted.id,
      url: newUrl,
      type: extracted.type,
    };

    saveTracks([...tracks, newTrack]);
    setNewUrl('');
    setShowAddForm(false);
    setActiveTrack(newTrack);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (!activeTrack && tracks.length > 0) {
      setActiveTrack(tracks[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (!activeTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setActiveTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!activeTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    setActiveTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  const getEmbedUrl = (track: SpotifyTrack) => {
    return `https://open.spotify.com/embed/${track.type}/${track.id}?utm_source=generator&theme=0`;
  };

  if (tracks.length === 0 && !showAddForm) {
    return (
      <motion.div
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="p-4 rounded-2xl bg-[#1DB954]/20 backdrop-blur-xl border border-[#1DB954]/30 shadow-lg hover:bg-[#1DB954]/30 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Music className="w-6 h-6 text-[#1DB954]" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
    >
      <motion.div
        className="rounded-2xl bg-secondary/80 backdrop-blur-xl border border-border/50 shadow-lg overflow-hidden"
        layout
      >
        {/* Add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-b border-border/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Add Music</span>
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Spotify URL..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="bg-background/50 text-xs h-9"
                />
                <Button size="sm" onClick={handleAddTrack} className="bg-[#1DB954] hover:bg-[#1DB954]/90">
                  Add
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded player with embed */}
        <AnimatePresence>
          {isExpanded && activeTrack && isPlaying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-[300px]"
            >
              <iframe
                src={getEmbedUrl(activeTrack)}
                width="100%"
                height={activeTrack.type === 'track' ? 80 : 152}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini controls */}
        <div className="p-3 flex items-center gap-2">
          {/* Equalizer animation */}
          <motion.div 
            className="flex items-end gap-0.5 h-5"
            animate={isPlaying ? { opacity: 1 } : { opacity: 0.5 }}
          >
            {[1, 2, 3, 4].map((bar) => (
              <motion.div
                key={bar}
                className="w-1 bg-[#1DB954] rounded-full"
                animate={isPlaying ? {
                  height: ['8px', '16px', '12px', '20px', '8px'],
                } : { height: '8px' }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: bar * 0.1,
                }}
              />
            ))}
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={handlePrev}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <motion.button
              onClick={handlePlayPause}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPlaying ? 'bg-[#1DB954]' : 'bg-secondary'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>
            
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={handleNext}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Expand/collapse and add */}
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Music className="w-4 h-4 text-[#1DB954]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}