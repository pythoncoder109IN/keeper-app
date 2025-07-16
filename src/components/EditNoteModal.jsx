import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  X, 
  Save, 
  Image, 
  Palette, 
  Upload,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useNotes } from '../context/NotesContext';
import DrawingCanvas from './DrawingCanvas';

const EditNoteModal = ({ note, isOpen, onClose }) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [images, setImages] = useState(note.images || []);
  const [drawing, setDrawing] = useState(note.drawing || null);
  const [showDrawing, setShowDrawing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateNote } = useNotes();
  const drawingRef = useRef();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
        isNew: true
      }));
      setImages(prev => [...prev, ...newImages]);
    },
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error('File is too large. Max size is 5MB.');
          } else if (error.code === 'file-invalid-type') {
            toast.error('Invalid file type. Only images are allowed.');
          }
        });
      });
    }
  });

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet',
    'blockquote', 'code-block', 'link'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() && !content.trim() && images.length === 0 && !drawing) {
      toast.error('Please add some content to your note');
      return;
    }

    setIsUpdating(true);

    try {
      // Process new images
      const processedImages = await Promise.all(
        images.map(async (img) => {
          if (img.isNew && img.file) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve({
                id: img.id,
                data: reader.result,
                name: img.file.name
              });
              reader.readAsDataURL(img.file);
            });
          }
          return img;
        })
      );

      const noteData = {
        title: title.trim() || 'Untitled',
        content: content.trim(),
        images: processedImages,
        drawing: drawing,
        updatedAt: new Date().toISOString()
      };

      const result = await updateNote(note._id, noteData);
      
      if (result.success) {
        toast.success('Note updated successfully!');
        onClose();
      } else {
        toast.error(result.message || 'Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Something went wrong');
    } finally {
      setIsUpdating(false);
    }
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      // Revoke object URL for new images to prevent memory leaks
      const removed = prev.find(img => img.id === imageId);
      if (removed && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const saveDrawing = () => {
    if (drawingRef.current) {
      const canvas = drawingRef.current.getCanvas();
      const drawingData = canvas.toDataURL();
      setDrawing(drawingData);
      setShowDrawing(false);
      toast.success('Drawing saved!');
    }
  };

  const clearDrawing = () => {
    setDrawing(null);
    toast.success('Drawing removed');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="modal-content max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Edit Note</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Enter note title..."
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your note content..."
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {isDragActive 
                    ? 'Drop images here...' 
                    : 'Drag & drop images, or click to select'
                  }
                </p>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {images.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={image.preview || image.data || image.url}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawing Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Drawing
                </label>
                <button
                  type="button"
                  onClick={() => setShowDrawing(!showDrawing)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
                >
                  <Palette className="w-4 h-4" />
                  <span>{showDrawing ? 'Hide Canvas' : 'Show Canvas'}</span>
                </button>
              </div>

              {/* Drawing Canvas */}
              <AnimatePresence>
                {showDrawing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <DrawingCanvas ref={drawingRef} />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowDrawing(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveDrawing}
                        className="btn-primary"
                      >
                        Save Drawing
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drawing Preview */}
              {drawing && !showDrawing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <img
                    src={drawing}
                    alt="Drawing"
                    className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={clearDrawing}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={isUpdating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isUpdating ? 'Updating...' : 'Update Note'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditNoteModal;