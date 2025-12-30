import { motion } from 'framer-motion';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { ChatSystem } from '@/components/chat/ChatSystem';

export function CommunityScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          Community
        </h1>
        <p className="text-muted-foreground">
          Connect with fellow learners and climb the ranks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Leaderboard />
        <ChatSystem />
      </div>
    </motion.div>
  );
}
