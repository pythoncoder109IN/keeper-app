import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="flex items-center space-x-2 text-gray-600">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
            <span>by Harsh Sharma</span>
            <span>© {currentYear}</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200"
            >
              <Twitter className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="mailto:contact@example.com"
              whileHover={{ scale: 1.1, y: -2 }}
              className="p-2 text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-all duration-200"
            >
              <Mail className="w-5 h-5" />
            </motion.a>
          </div>

          {/* Version */}
          <div className="text-sm text-gray-500">
            v2.0.0
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            Built with React, Tailwind CSS, and Framer Motion. 
            <span className="mx-2">•</span>
            Your notes are secure and private.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;