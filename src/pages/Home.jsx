import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Heart } from 'lucide-react';
import CreateArea from '../components/CreateArea';
import NotesGrid from '../components/NotesGrid';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import { Card, CardContent } from '../components/ui/Card';

const Home = () => {
  const { user } = useAuth();
  const { getStats } = useNotes();
  const stats = getStats();

  const statCards = [
    {
      title: 'Total Notes',
      value: stats.total,
      icon: Sparkles,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Favorites',
      value: stats.favorites,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'With Images',
      value: stats.withImages,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'With Drawings',
      value: stats.withDrawings,
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-custom section-spacing"
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{ 
              background: [
                'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl blur-xl opacity-30"
          />
          <div className="relative bg-background/80 backdrop-blur-xl rounded-2xl p-8 border border-border">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome back,{' '}
              <span className="gradient-text">
                {user?.name?.split(' ')[0] || 'there'}
              </span>
              ! 👋
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Capture your thoughts, ideas, and memories with our powerful note-taking platform
            </motion.p>
            
            {/* Quick Stats */}
            {stats.total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
              >
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.title}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Create Note Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CreateArea />
      </motion.div>

      {/* Notes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <NotesGrid />
      </motion.div>
    </motion.div>
  );
};

export default Home;