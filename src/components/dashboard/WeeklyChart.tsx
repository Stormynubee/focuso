import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';

export function WeeklyChart() {
  const { getWeeklyStats, distractions } = useAppStore();
  const weeklyStats = getWeeklyStats();

  // Get distraction breakdown for pie chart
  const distractionBreakdown = distractions.reduce((acc, d) => {
    const existing = acc.find((item) => item.name === d.appName);
    if (existing) {
      existing.value += d.duration;
    } else {
      acc.push({ name: d.appName, value: d.duration });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = [
    'hsl(var(--distraction))',
    'hsl(var(--warning))',
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    'hsl(var(--muted-foreground))',
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-3 py-2 text-sm">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}m
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weekly bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6" hover={false}>
          <h3 className="text-lg font-display font-semibold mb-4">Weekly Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats} barGap={4}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="study" 
                  name="Study"
                  fill="hsl(var(--study))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="distraction" 
                  name="Distraction"
                  fill="hsl(var(--distraction))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-study" />
              <span className="text-sm text-muted-foreground">Study</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-distraction" />
              <span className="text-sm text-muted-foreground">Distraction</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Distraction breakdown pie chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-6" hover={false}>
          <h3 className="text-lg font-display font-semibold mb-4">Distraction Breakdown</h3>
          {distractionBreakdown.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distractionBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {distractionBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {distractionBreakdown.slice(0, 5).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                No distractions logged yet.<br />
                Keep up the focus! 🎯
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
