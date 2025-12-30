import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Play, Pause, SkipBack, SkipForward, ChevronDown, ChevronUp, Lock, Unlock, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCatThemeStore } from '@/store/useCatThemeStore';

interface SpotifyTrack {
  id: string;
  url: string;
  type: 'track' | 'playlist' | 'album';
}

const CAT_COLORS = {
  default: { body: '#2A2A35', accent: '#F5E6D3' },
  orange: { body: '#E8956A', accent: '#FDF8F5' },
  gray: { body: '#8A8A96', accent: '#FDF8F5' },
  calico: { body: '#E8956A', accent: '#2A2A35' },
};

export function SpotifyCat() {
  const { 
    isEnabled, 
    spotifyCatEnabled, 
    spotifyCatStyle, 
    spotifyCatPosition, 
    spotifyCatLocked,
    setSpotifyCatPosition,
    animationIntensity 
  } = useCatThemeStore();
  
  const [tracks, setTracks] = useState<SpotifyTrack[]>(() => {
    try {
      const saved = localStorage.getItem('focusos-spotify');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeTrack, setActiveTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const colors = CAT_COLORS[spotifyCatStyle] || CAT_COLORS.default;
  const animSpeed = animationIntensity === 'low' ? 1.5 : animationIntensity === 'medium' ? 1 : 0.6;

  // Memoize default position to avoid recalculating on every render
  const defaultPosition = useMemo(() => ({ 
    x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 320) : 20, 
    y: typeof window !== 'undefined' ? Math.max(20, window.innerHeight - 200) : 20 
  }), []);
  
  const position = spotifyCatPosition || defaultPosition;

  const saveTracks = useCallback((updatedTracks: SpotifyTrack[]) => {
    setTracks(updatedTracks);
    localStorage.setItem('focusos-spotify', JSON.stringify(updatedTracks));
  }, []);

  const extractSpotifyId = useCallback((url: string): { id: string; type: 'track' | 'playlist' | 'album' } | null => {
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
  }, []);

  const handleAddTrack = useCallback(() => {
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
  }, [newUrl, tracks, saveTracks, extractSpotifyId]);

  const handlePlayPause = useCallback(() => {
    if (!activeTrack && tracks.length > 0) {
      setActiveTrack(tracks[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [activeTrack, tracks]);

  const handleNext = useCallback(() => {
    if (!activeTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setActiveTrack(tracks[nextIndex]);
    setIsPlaying(true);
  }, [activeTrack, tracks]);

  const handlePrev = useCallback(() => {
    if (!activeTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    setActiveTrack(tracks[prevIndex]);
    setIsPlaying(true);
  }, [activeTrack, tracks]);

  const getEmbedUrl = useCallback((track: SpotifyTrack) => {
    return `https://open.spotify.com/embed/${track.type}/${track.id}?utm_source=generator&theme=0`;
  }, []);

  // Only update position on drag end to avoid excessive state updates
  const handleDragEnd = useCallback((event: any, info: any) => {
    if (spotifyCatLocked) return;
    setIsDragging(false);
    setSpotifyCatPosition({
      x: Math.max(0, Math.min(window.innerWidth - 300, position.x + info.offset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 100, position.y + info.offset.y)),
    });
  }, [spotifyCatLocked, position, setSpotifyCatPosition]);

  if (!isEnabled || !spotifyCatEnabled) {
    return null;
  }

  // Cat Face SVG for the player
  const CatPlayerFace = ({ playing }: { playing: boolean }) => (
    <svg width="40" height="40" viewBox="0 0 40 40">
      {/* Head */}
      <circle cx="20" cy="22" r="14" fill={colors.body} />
      
      {/* Ears */}
      <path d="M8 14 L12 4 L18 12" fill={colors.body} />
      <path d="M22 12 L28 4 L32 14" fill={colors.body} />
      <path d="M10 13 L13 6 L16 12" fill={colors.accent} />
      <path d="M24 12 L27 6 L30 13" fill={colors.accent} />
      
      {/* Eyes */}
      {playing ? (
        // Happy closed eyes when playing
        <>
          <motion.path 
            d="M14 20 Q16 17, 18 20" 
            stroke={colors.accent} 
            strokeWidth="2" 
            fill="none"
            animate={{ d: ["M14 20 Q16 17, 18 20", "M14 19 Q16 16, 18 19", "M14 20 Q16 17, 18 20"] }}
            transition={{ duration: animSpeed * 2, repeat: Infinity }}
          />
          <motion.path 
            d="M22 20 Q24 17, 26 20" 
            stroke={colors.accent} 
            strokeWidth="2" 
            fill="none"
            animate={{ d: ["M22 20 Q24 17, 26 20", "M22 19 Q24 16, 26 19", "M22 20 Q24 17, 26 20"] }}
            transition={{ duration: animSpeed * 2, repeat: Infinity }}
          />
        </>
      ) : (
        // Open eyes when idle
        <>
          <circle cx="15" cy="20" r="3" fill={colors.accent} />
          <circle cx="25" cy="20" r="3" fill={colors.accent} />
          <circle cx="15" cy="20" r="1.5" fill={colors.body} />
          <circle cx="25" cy="20" r="1.5" fill={colors.body} />
        </>
      )}
      
      {/* Nose */}
      <ellipse cx="20" cy="26" rx="2" ry="1.5" fill="#FFCDB2" />
      
      {/* Mouth */}
      <path d="M17 28 Q20 31, 23 28" stroke={colors.accent} strokeWidth="1.5" fill="none" />
      
      {/* Whiskers */}
      <motion.g
        animate={playing ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: animSpeed, repeat: Infinity }}
      >
        <line x1="8" y1="24" x2="2" y2="22" stroke={colors.accent} strokeWidth="1" opacity={0.6} />
        <line x1="8" y1="26" x2="2" y2="26" stroke={colors.accent} strokeWidth="1" opacity={0.6} />
        <line x1="8" y1="28" x2="2" y2="30" stroke={colors.accent} strokeWidth="1" opacity={0.6} />
        <line x1="32" y1="24" x2="38" y2="22" stroke={colors.accent} strokeWidth="1" opacity={0.6} />
        <line x1="32" y1="26" x2="38" y2="26" stroke={colors.accent} strokeWidth="1" opacity={0.6} />
        <line x1="32" y1="28" x2="38" y2="30" stroke={colors.accent} strokeWidth="1" opacity={0.6} />
      </motion.g>
      
      {/* Headphones when playing */}
      {playing && (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <path d="M6 18 Q6 8, 20 8 Q34 8, 34 18" stroke="#1DB954" strokeWidth="3" fill="none" />
          <circle cx="6" cy="20" r="4" fill="#1DB954" />
          <circle cx="34" cy="20" r="4" fill="#1DB954" />
        </motion.g>
      )}
    </svg>
  );

  if (tracks.length === 0 && !showAddForm) {
    return (
      <motion.div
        ref={containerRef}
        className="fixed z-50"
        style={{ left: position.x, top: position.y }}
        drag={!spotifyCatLocked}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <motion.button
          onClick={() => !isDragging && setShowAddForm(true)}
          className="relative p-2 rounded-2xl bg-[#1DB954]/20 backdrop-blur-xl border border-[#1DB954]/30 shadow-lg hover:bg-[#1DB954]/30 transition-all cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CatPlayerFace playing={false} />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center">
            <Music className="w-3 h-3 text-black" />
          </div>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="fixed z-50"
      style={{ left: position.x, top: position.y }}
      drag={!spotifyCatLocked}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
    >
      <motion.div
        className="rounded-2xl bg-secondary/90 backdrop-blur-xl border border-border/50 shadow-lg overflow-hidden"
        layout
      >
        {/* Drag handle */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-secondary/50 cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <CatPlayerFace playing={isPlaying} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => useCatThemeStore.getState().setSpotifyCatLocked(!spotifyCatLocked)}
          >
            {spotifyCatLocked ? (
              <Lock className="w-3 h-3 text-[#1DB954]" />
            ) : (
              <Unlock className="w-3 h-3 text-muted-foreground" />
            )}
          </Button>
        </div>

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
              className="w-[280px]"
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