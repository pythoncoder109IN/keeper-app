import { motion } from 'framer-motion';
import CreateArea from '../components/CreateArea';
import NotesGrid from '../components/NotesGrid';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';

const Home = () => {
  const { user } = useAuth();
  const { getStats } = useNotes();
  const stats = getStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-normal text-gray-800 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mb-6">
          Capture your thoughts, ideas, and memories with rich content
        </p>
        
        {/* Quick Stats */}
        {stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8"
          >
            <div className="flex items-center space-x-1">
              <span className="font-medium text-primary-600">{stats.total}</span>
              <span>notes</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-yellow-600">{stats.favorites}</span>
              <span>favorites</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-blue-600">{stats.withImages}</span>
              <span>with images</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-purple-600">{stats.withDrawings}</span>
              <span>with drawings</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Create Note Area */}
      <CreateArea />

      {/* Notes Grid */}
      <NotesGrid />
    </motion.div>
  );
};

export default Home;