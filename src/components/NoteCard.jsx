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
  Download,
  Copy,
  Eye,
  Clock,
  Tag
} from 'lucide-react';
import { formatRelativeTime, stripHtml, truncateText } from '../lib/utils';
import toast from 'react-hot-toast';
import { useNotes } from '../context/NotesContext';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';
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

  const handleCopyContent = async () => {
    try {
      const content = `${note.title}\n\n${stripHtml(note.content)}`;
      await navigator.clipboard.writeText(content);
      toast.success('Note content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy content');
    }
    setShowMenu(false);
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text(note.title, 20, 30);
      
      // Add content
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const content = stripHtml(note.content);
      const splitContent = pdf.splitTextToSize(content, 170);
      pdf.text(splitContent, 20, 50);
      
      // Add metadata
      let yPosition = 50 + (splitContent.length * 5) + 20;
      pdf.setFontSize(10);
      pdf.setTextColor(128);
      pdf.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, 20, yPosition);
      
      if (note.images && note.images.length > 0) {
        yPosition += 10;
        pdf.text(`Images: ${note.images.length}`, 20, yPosition);
      }
      
      if (note.drawing) {
        yPosition += 10;
        pdf.text('Contains drawing', 20, yPosition);
      }
      
      pdf.save(`${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
    setShowMenu(false);
  };

  const contentPreview = stripHtml(note.content);
  const hasMedia = (note.images && note.images.length > 0) || note.drawing;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="note-card h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight text-foreground truncate">
                  {note.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatRelativeTime(note.createdAt)}
                  </div>
                  {hasMedia && (
                    <div className="flex items-center space-x-1">
                      {note.images && note.images.length > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {note.images.length}
                        </div>
                      )}
                      {note.drawing && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Palette className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={`w-8 h-8 ${
                    note.isFavorite
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-muted-foreground hover:text-yellow-500'
                  }`}
                >
                  <Star 
                    className="w-4 h-4" 
                    fill={note.isFavorite ? 'currentColor' : 'none'} 
                  />
                </Button>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-8 h-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute right-0 top-8 bg-background rounded-lg shadow-lg border border-border py-1 z-20 min-w-[160px]"
                      >
                        <button
                          onClick={() => {
                            setShowEditModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowShareModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                        <button
                          onClick={handleCopyContent}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={handleExportPDF}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export PDF</span>
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={handleDelete}
                          className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Content Preview */}
            {contentPreview && (
              <div className="text-sm text-muted-foreground leading-relaxed mb-4">
                <div className="truncate-3">
                  {truncateText(contentPreview, 150)}
                </div>
              </div>
            )}

            {/* Media Preview */}
            {hasMedia && (
              <div className="space-y-3 mb-4">
                {/* Images */}
                {note.images && note.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {note.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={image.data || image.url}
                          alt={`Note image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-border"
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
                      className="w-full h-32 object-cover rounded-lg border border-border bg-white"
                    />
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Drawing
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{note.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
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