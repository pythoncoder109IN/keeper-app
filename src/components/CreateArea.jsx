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
  Loader2,
  Sparkles,
  Mic,
  Camera
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useNotes } from '../context/NotesContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent } from './ui/Card';
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
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }));
      setImages(prev => [...prev, ...newImages]);
      toast.success(`${acceptedFiles.length} image(s) added`);
    },
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error('File is too large. Max size is 10MB.');
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
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'blockquote', 'code-block', 'link', 'image', 'align'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() && !content.trim() && images.length === 0 && !drawing) {
      toast.error('Please add some content to your note');
      return;
    }

    setIsCreating(true);

    try {
      // Convert images to base64 for storage
      const imageData = await Promise.all(
        images.map(async (img) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
              id: img.id,
              data: reader.result,
              name: img.file.name,
              size: img.file.size,
              type: img.file.type
            });
            reader.readAsDataURL(img.file);
          });
        })
      );

      const noteData = {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        images: imageData,
        drawing: drawing,
        tags: [],
        createdAt: new Date().toISOString()
      };

      const result = await createNote(noteData);
      
      if (result.success) {
        toast.success('Note created successfully! ✨');
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
      const removed = prev.find(img => img.id === imageId);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
    toast.success('Image removed');
  };

  const saveDrawing = () => {
    if (drawingRef.current) {
      const canvas = drawingRef.current.getCanvas();
      const drawingData = canvas.toDataURL();
      setDrawing(drawingData);
      setShowDrawing(false);
      toast.success('Drawing saved! 🎨');
    }
  };

  const clearDrawing = () => {
    setDrawing(null);
    toast.success('Drawing removed');
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setTitle('');
    setContent('');
    setImages([]);
    setDrawing(null);
    setShowDrawing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mb-8"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit}>
            {/* Title Input */}
            <div className="p-6 pb-0">
              <Input
                type="text"
                placeholder="Take a note..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onClick={() => setIsExpanded(true)}
                className="text-lg font-medium border-none shadow-none bg-transparent focus:ring-0 px-0"
              />
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 p-6 pt-4"
                >
                  {/* Rich Text Editor */}
                  <div className="rounded-xl overflow-hidden border border-border">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your note content..."
                      className="bg-background"
                    />
                  </div>

                  {/* Image Upload Area */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive 
                        ? 'border-primary bg-primary/5 scale-105' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <motion.div
                      animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                      className="space-y-3"
                    >
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          {isDragActive 
                            ? 'Drop images here...' 
                            : 'Drag & drop images, or click to select'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Support for JPEG, PNG, GIF, WebP • Max 10 images, 10MB each
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {images.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative group"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={image.preview}
                              alt="Preview"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded text-center truncate">
                            {image.file.name}
                          </div>
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
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDrawing(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={saveDrawing}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Save Drawing
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Drawing Preview */}
                  {drawing && !showDrawing && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="rounded-xl overflow-hidden border border-border">
                        <img
                          src={drawing}
                          alt="Drawing"
                          className="w-full max-h-64 object-contain bg-white"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={clearDrawing}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDrawing(!showDrawing)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Palette className="w-5 h-5" />
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Mic className="w-5 h-5" />
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Camera className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isCreating}
                        loading={isCreating}
                        className="min-w-[120px]"
                      >
                        {!isCreating && <Plus className="w-4 h-4 mr-2" />}
                        {isCreating ? 'Creating...' : 'Create Note'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateArea;