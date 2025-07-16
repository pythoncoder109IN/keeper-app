import { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { motion } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Palette, 
  Eraser, 
  RotateCcw, 
  Download,
  Minus,
  Plus
} from 'lucide-react';

const DrawingCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef();
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [isErasing, setIsErasing] = useState(false);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    clear: () => canvasRef.current?.clear(),
    isEmpty: () => canvasRef.current?.isEmpty(),
  }));

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  const handleClear = () => {
    canvasRef.current?.clear();
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = dataURL;
      link.click();
    }
  };

  const handleColorChange = (color) => {
    setPenColor(color);
    setIsErasing(false);
  };

  const handleEraser = () => {
    setIsErasing(!isErasing);
    setPenColor(isErasing ? '#000000' : '#FFFFFF');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-gray-200 p-4 space-y-4"
    >
      {/* Drawing Tools */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg">
        {/* Color Palette */}
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-gray-600" />
          <div className="flex space-x-1">
            {colors.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleColorChange(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                  penColor === color && !isErasing
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Pen Width */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Size:</span>
          <button
            onClick={() => setPenWidth(Math.max(1, penWidth - 1))}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{penWidth}</span>
          <button
            onClick={() => setPenWidth(Math.min(10, penWidth + 1))}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Tools */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEraser}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isErasing
                ? 'bg-red-100 text-red-600'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClear}
            className="p-2 bg-white text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Clear canvas"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="p-2 bg-white text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Download drawing"
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Canvas */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden">
        <SignatureCanvas
          ref={canvasRef}
          canvasProps={{
            width: 600,
            height: 400,
            className: 'w-full h-auto max-w-full'
          }}
          penColor={penColor}
          minWidth={penWidth}
          maxWidth={penWidth}
          backgroundColor="white"
        />
      </div>

      {/* Canvas Info */}
      <div className="text-sm text-gray-500 text-center">
        Draw with your mouse or touch. Use the tools above to customize your drawing.
      </div>
    </motion.div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;