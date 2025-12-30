import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Play, Pause, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';

interface SpotifyTrack {
  id: string;
  url: string;
  type: 'track' | 'playlist' | 'album';
}

export function SpotifyPlayer() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>(() => {
    const saved = localStorage.getItem('focusos-spotify');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [activeTrack, setActiveTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const saveTracks = (updatedTracks: SpotifyTrack[]) => {
    setTracks(updatedTracks);
    localStorage.setItem('focusos-spotify', JSON.stringify(updatedTracks));
  };

  const extractSpotifyId = (url: string): { id: string; type: 'track' | 'playlist' | 'album' } | null => {
    try {
      // Handle different Spotify URL formats
      // https://open.spotify.com/track/xxx
      // https://open.spotify.com/playlist/xxx
      // https://open.spotify.com/album/xxx
      // spotify:track:xxx
      
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

      if (id) {
        return { id, type };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleAddTrack = () => {
    const extracted = extractSpotifyId(newUrl);
    if (!extracted) {
      return;
    }

    const newTrack: SpotifyTrack = {
      id: extracted.id,
      url: newUrl,
      type: extracted.type,
    };

    saveTracks([...tracks, newTrack]);
    setNewUrl('');
    setShowAddTrack(false);
    
    // Auto-play the newly added track
    setActiveTrack(newTrack);
    setIsPlaying(true);
  };

  const handleRemoveTrack = (id: string) => {
    saveTracks(tracks.filter((t) => t.id !== id));
    if (activeTrack?.id === id) {
      setActiveTrack(null);
      setIsPlaying(false);
    }
  };

  const handlePlayTrack = (track: SpotifyTrack) => {
    if (activeTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
    }
  };

  const getEmbedUrl = (track: SpotifyTrack) => {
    return `https://open.spotify.com/embed/${track.type}/${track.id}?utm_source=generator&theme=0`;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#1DB954]/20">
            <Music className="w-5 h-5 text-[#1DB954]" />
          </div>
          <h3 className="text-lg font-display font-semibold">Focus Music</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddTrack(!showAddTrack)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Add Track Form */}
      <AnimatePresence>
        {showAddTrack && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-secondary/30 border border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-3">
              Paste a Spotify track, playlist, or album URL
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://open.spotify.com/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-secondary/50 flex-1"
              />
              <Button onClick={handleAddTrack} variant="glow">
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supports tracks, playlists, and albums
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotify Player Embed */}
      <AnimatePresence>
        {activeTrack && isPlaying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="rounded-xl overflow-hidden">
              <iframe
                src={getEmbedUrl(activeTrack)}
                width="100%"
                height={activeTrack.type === 'track' ? 152 : 352}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track List */}
      {tracks.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Music className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No music added yet</p>
          <p className="text-xs">Add Spotify songs to focus with music</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTrack?.id === track.id
                  ? 'bg-[#1DB954]/10 border border-[#1DB954]/30'
                  : 'bg-secondary/20 hover:bg-secondary/30'
              }`}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePlayTrack(track)}
                className={`w-10 h-10 rounded-full ${
                  activeTrack?.id === track.id && isPlaying
                    ? 'bg-[#1DB954] text-black hover:bg-[#1DB954]/90'
                    : ''
                }`}
              >
                {activeTrack?.id === track.id && isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate capitalize">
                  {track.type}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {track.id}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(track.url, '_blank')}
                  className="w-8 h-8"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTrack(track.id)}
                  className="w-8 h-8 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Spotify branding */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Powered by</span>
        <span className="text-[#1DB954] font-medium">Spotify</span>
      </div>
    </GlassCard>
  );
}
