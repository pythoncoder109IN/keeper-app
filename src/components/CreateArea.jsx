import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Plus, 
  Image, 
  Palette, 
  Type, 
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useNotes } from '../context/NotesContext';
import DrawingCanvas from './DrawingCanvas';

const CreateArea = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [showDrawing, setShowDrawing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { createNote } = useNotes();
  const drawingRef = useRef();

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
        id: Math.random().toString(36).substr(2, 9)
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

    setIsCreating(true);

    try {
      // Convert images to base64 for storage (in real app, upload to cloud storage)
      const imageData = await Promise.all(
        images.map(async (img) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
              id: img.id,
              data: reader.result,
              name: img.file.name
            });
            reader.readAsDataURL(img.file);
          });
        })
      );

      const noteData = {
        title: title.trim() || 'Untitled',
        content: content.trim(),
        images: imageData,
        drawing: drawing,
        createdAt: new Date().toISOString()
      };

      const result = await createNote(noteData);
      
      if (result.success) {
        toast.success('Note created successfully!');
        // Reset form
        setTitle('');
        setContent('');
        setImages([]);
        setDrawing(null);
        setIsExpanded(false);
        setShowDrawing(false);
      } else {
        toast.error(result.message || 'Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      // Revoke object URL to prevent memory leaks
      const removed = prev.find(img => img.id === imageId);
      if (removed) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mb-8"
    >
      <form onSubmit={handleSubmit} className="create-note">
        <div className="space-y-4">
          {/* Title Input */}
          <input
            type="text"
            placeholder="Take a note..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onClick={() => setIsExpanded(true)}
            className="w-full text-lg font-medium placeholder-gray-500 border-none outline-none bg-transparent resize-none"
          />

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Rich Text Editor */}
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

                {/* Image Upload Area */}
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
                  <p className="text-sm text-gray-500 mt-1">
                    Max 5 images, 5MB each
                  </p>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((image) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <img
                          src={image.preview}
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

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDrawing(!showDrawing)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                      title="Add drawing"
                    >
                      <Palette className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        setTitle('');
                        setContent('');
                        setImages([]);
                        setDrawing(null);
                        setShowDrawing(false);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isCreating}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      <span>{isCreating ? 'Creating...' : 'Create Note'}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateArea;