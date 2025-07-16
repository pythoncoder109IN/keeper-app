import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Star, Search } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import NoteCard from './NoteCard';
import LoadingSpinner from './LoadingSpinner';

const NotesGrid = () => {
  const { notes, loading, searchTerm, filterFavorites } = useNotes();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="large" text="Loading your notes..." />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto">
          {searchTerm || filterFavorites ? (
            <>
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No notes found
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `No notes match "${searchTerm}"`
                  : 'No favorite notes yet'
                }
              </p>
            </>
          ) : (
            <>
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No notes yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start by creating your first note above. You can add text, images, and even drawings!
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>Rich text</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Favorites</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {notes.map((note) => (
          <NoteCard key={note._id} note={note} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotesGrid;