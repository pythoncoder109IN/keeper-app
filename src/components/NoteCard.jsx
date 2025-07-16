import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Edit3, 
  Trash2, 
  Share2, 
  Image as ImageIcon,
  Palette,
  MoreVertical,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNotes } from '../context/NotesContext';
import EditNoteModal from './EditNoteModal';
import ShareModal from './ShareModal';

const NoteCard = ({ note }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { deleteNote, toggleFavorite } = useNotes();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const result = await deleteNote(note._id);
      if (result.success) {
        toast.success('Note deleted successfully');
      } else {
        toast.error(result.message || 'Failed to delete note');
      }
    }
    setShowMenu(false);
  };

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(note._id);
    if (result.success) {
      toast.success(note.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } else {
      toast.error(result.message || 'Failed to update favorite');
    }
    setShowMenu(false);
  };

  const handleExportPDF = async () => {
    try {
      // Dynamic import to reduce bundle size
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(note.title, 20, 30);
      
      // Add content (strip HTML tags for PDF)
      pdf.setFontSize(12);
      const content = note.content.replace(/<[^>]*>/g, '');
      const splitContent = pdf.splitTextToSize(content, 170);
      pdf.text(splitContent, 20, 50);
      
      // Add images if any
      if (note.images && note.images.length > 0) {
        let yPosition = 50 + (splitContent.length * 5) + 20;
        
        for (const image of note.images) {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 30;
          }
          
          try {
            pdf.addImage(image.data, 'JPEG', 20, yPosition, 100, 60);
            yPosition += 70;
          } catch (error) {
            console.error('Error adding image to PDF:', error);
          }
        }
      }
      
      // Add drawing if any
      if (note.drawing) {
        if (pdf.internal.pageSize.height - 80 < 80) {
          pdf.addPage();
        }
        try {
          pdf.addImage(note.drawing, 'PNG', 20, pdf.internal.pageSize.height - 80, 100, 60);
        } catch (error) {
          console.error('Error adding drawing to PDF:', error);
        }
      }
      
      pdf.save(`${note.title}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
    setShowMenu(false);
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className="note-card group relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight flex-1 pr-2">
            {note.title}
          </h3>
          
          <div className="flex items-center space-x-1">
            {/* Favorite Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                note.isFavorite
                  ? 'text-yellow-500 bg-yellow-50'
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
              }`}
            >
              <Star 
                className="w-4 h-4" 
                fill={note.isFavorite ? 'currentColor' : 'none'} 
              />
            </motion.button>

            {/* Menu Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>

              {/* Dropdown Menu */}
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]"
                >
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export PDF</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {note.content && (
          <div className="text-gray-600 text-sm leading-relaxed mb-4">
            {truncateText(stripHtml(note.content))}
          </div>
        )}

        {/* Media Preview */}
        <div className="space-y-3 mb-4">
          {/* Images */}
          {note.images && note.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {note.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.data || image.url}
                    alt={`Note image ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
                  {index === 3 && note.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        +{note.images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Drawing */}
          {note.drawing && (
            <div className="relative">
              <img
                src={note.drawing}
                alt="Note drawing"
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {note.images && note.images.length > 0 && (
              <div className="flex items-center space-x-1">
                <ImageIcon className="w-3 h-3" />
                <span>{note.images.length}</span>
              </div>
            )}
            {note.drawing && (
              <div className="flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Drawing</span>
              </div>
            )}
          </div>
          
          <time>
            {note.createdAt ? format(new Date(note.createdAt), 'MMM d, yyyy') : 'Recently'}
          </time>
        </div>

        {/* Click outside to close menu */}
        {showMenu && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setShowMenu(false)}
          />
        )}
      </motion.div>

      {/* Modals */}
      {showEditModal && (
        <EditNoteModal
          note={note}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          note={note}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default NoteCard;