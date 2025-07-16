import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Highlighter, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Search,
  Star,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm, filterFavorites, setFilterFavorites } = useNotes();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const isHomePage = location.pathname === '/';

  return (
    <motion.header 
      className="bg-gradient-to-r from-primary-500 to-primary-600 shadow-xl sticky top-0 z-40"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Highlighter className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-white font-display text-2xl md:text-3xl font-normal group-hover:text-yellow-200 transition-colors duration-200">
              Keeper
            </h1>
          </Link>

          {/* Search and Filters - Desktop */}
          {user && isHomePage && (
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  filterFavorites 
                    ? 'bg-yellow-400 text-primary-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Star className="w-5 h-5" fill={filterFavorites ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
          )}

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 text-white"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{user.name}</span>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200 text-white"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </motion.button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 text-white hover:text-yellow-200 transition-colors duration-200 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-white text-primary-600 hover:bg-yellow-100 rounded-xl transition-all duration-200 font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/20 rounded-xl transition-colors duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Search - when on home page */}
        {user && isHomePage && (
          <div className="md:hidden mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Filters:</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                  filterFavorites 
                    ? 'bg-yellow-400 text-primary-600' 
                    : 'bg-white/20 text-white'
                }`}
              >
                <Star className="w-4 h-4" fill={filterFavorites ? 'currentColor' : 'none'} />
                <span className="text-sm">Favorites</span>
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary-600 border-t border-primary-400/20"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 text-white"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile ({user.name})</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200 text-white w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block p-3 text-white hover:bg-white/20 rounded-xl transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block p-3 bg-white text-primary-600 hover:bg-yellow-100 rounded-xl transition-all duration-200 text-center font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;