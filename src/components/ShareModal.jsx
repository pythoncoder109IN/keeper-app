import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Share2, 
  Mail, 
  MessageCircle, 
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  QrCode,
  Download,
  Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotes } from '../context/NotesContext';

const ShareModal = ({ note, isOpen, onClose }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { shareNote } = useNotes();

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    try {
      const result = await shareNote(note._id, { type: 'public' });
      if (result.success) {
        setShareUrl(result.shareUrl);
        toast.success('Share link generated!');
      } else {
        toast.error(result.message || 'Failed to generate share link');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Something went wrong');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Copied to clipboard!');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this note: ${note.title}`);
    const body = encodeURIComponent(
      `I wanted to share this note with you:\n\n${note.title}\n\n${stripHtml(note.content)}\n\n${shareUrl ? `View online: ${shareUrl}` : ''}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out this note: ${note.title}\n\n${stripHtml(note.content)}\n\n${shareUrl || ''}`
    );
    window.open(`https://wa.me/?text=${text}`);
  };

  const shareViaSMS = () => {
    const text = encodeURIComponent(
      `Check out this note: ${note.title}\n\n${stripHtml(note.content)}\n\n${shareUrl || ''}`
    );
    window.open(`sms:?body=${text}`);
  };

  const shareViaFacebook = () => {
    if (shareUrl) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
    } else {
      toast.error('Please generate a share link first');
    }
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`Check out this note: ${note.title}`);
    const url = shareUrl ? encodeURIComponent(shareUrl) : '';
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
  };

  const shareViaLinkedIn = () => {
    if (shareUrl) {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
    } else {
      toast.error('Please generate a share link first');
    }
  };

  const generateQRCode = async () => {
    if (!shareUrl) {
      toast.error('Please generate a share link first');
      return;
    }
    
    try {
      // In a real app, you'd use a QR code library like qrcode
      // For now, we'll use a QR code API service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
      setShowQR(qrUrl);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const downloadNote = async () => {
    try {
      const content = `${note.title}\n\n${stripHtml(note.content)}\n\nCreated: ${new Date(note.createdAt).toLocaleDateString()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Note downloaded!');
    } catch (error) {
      toast.error('Failed to download note');
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="modal-content max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Share2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-800">Share Note</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Note Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">{note.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {stripHtml(note.content)}
              </p>
            </div>

            {/* Share Link Generation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Public Share Link
                </label>
                <button
                  onClick={generateShareLink}
                  disabled={isGeneratingLink}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {isGeneratingLink ? 'Generating...' : 'Generate'}
                </button>
              </div>
              
              {shareUrl && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                  />
                  <button
                    onClick={() => copyToClipboard(shareUrl)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => copyToClipboard(`${note.title}\n\n${stripHtml(note.content)}`)}
                className="flex items-center justify-center space-x-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">Copy Text</span>
              </button>
              
              <button
                onClick={downloadNote}
                className="flex items-center justify-center space-x-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </button>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Share via</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaEmail}
                  className="flex items-center space-x-3 p-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Email</span>
                </button>
                
                <button
                  onClick={shareViaWhatsApp}
                  className="flex items-center space-x-3 p-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">WhatsApp</span>
                </button>
                
                <button
                  onClick={shareViaSMS}
                  className="flex items-center space-x-3 p-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">SMS</span>
                </button>
                
                <button
                  onClick={shareViaTwitter}
                  className="flex items-center space-x-3 p-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Twitter</span>
                </button>
              </div>

              {/* Additional Options */}
              <div className="flex space-x-2">
                <button
                  onClick={shareViaFacebook}
                  className="flex-1 flex items-center justify-center space-x-2 p-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">Facebook</span>
                </button>
                
                <button
                  onClick={shareViaLinkedIn}
                  className="flex-1 flex items-center justify-center space-x-2 p-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  <span className="text-xs">LinkedIn</span>
                </button>
                
                <button
                  onClick={generateQRCode}
                  className="flex-1 flex items-center justify-center space-x-2 p-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <QrCode className="w-4 h-4 text-gray-600" />
                  <span className="text-xs">QR Code</span>
                </button>
              </div>
            </div>

            {/* QR Code Display */}
            {showQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-3"
              >
                <img
                  src={showQR}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                />
                <p className="text-sm text-gray-600">
                  Scan this QR code to view the note
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;