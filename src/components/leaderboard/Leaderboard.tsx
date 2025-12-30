import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_study_minutes: number;
  rank: number;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, total_study_minutes')
        .order('total_study_minutes', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankedData = (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      setEntries(rankedData);

      // Find current user's rank
      if (user) {
        const currentUserRank = rankedData.find(e => e.user_id === user.id);
        setUserRank(currentUserRank?.rank || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/10 border-amber-600/30';
      default:
        return 'bg-secondary/50 border-border/50';
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-display font-bold">Leaderboard</h2>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-display font-bold">Leaderboard</h2>
        </div>
        {userRank && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm">
            <span>Your rank:</span>
            <span className="font-bold">#{userRank}</span>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No study sessions recorded yet</p>
          <p className="text-sm">Start studying to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 10).map((entry, index) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${getRankBackground(entry.rank)} ${
                user?.id === entry.user_id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-lg font-bold">
                {entry.display_name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {entry.display_name}
                  {user?.id === entry.user_id && (
                    <span className="text-primary text-xs ml-2">(You)</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{formatTime(entry.total_study_minutes)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
