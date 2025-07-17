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
  Filter,
  Settings,
  Bell,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm, filterFavorites, setFilterFavorites } = useNotes();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const isHomePage = location.pathname === '/';

  return (
    <motion.header 
      className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-primary to-purple-500 p-2 rounded-xl">
                <Highlighter className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Keeper
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Your digital memory</p>
            </div>
          </Link>

          {/* Search and Filters - Desktop */}
          {user && isHomePage && (
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <Button
                variant={filterFavorites ? "default" : "outline"}
                size="icon"
                onClick={() => setFilterFavorites(!filterFavorites)}
                className="shrink-0"
              >
                <Star className="w-4 h-4" fill={filterFavorites ? 'currentColor' : 'none'} />
              </Button>
            </div>
          )}

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-muted-foreground"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="w-4 h-4" />
              </Button>

              <Link to="/profile">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-muted-foreground"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Search - when on home page */}
        {user && isHomePage && (
          <div className="md:hidden pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Filters:</span>
              <Button
                variant={filterFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFavorites(!filterFavorites)}
                className="flex items-center space-x-2"
              >
                <Star className="w-4 h-4" fill={filterFavorites ? 'currentColor' : 'none'} />
                <span>Favorites</span>
              </Button>
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
            className="md:hidden border-t bg-background/95 backdrop-blur-xl"
          >
            <div className="container-custom py-4 space-y-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </Link>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <Moon className="w-5 h-5 text-muted-foreground" />
                      <span>Dark Mode</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleDarkMode}
                    >
                      {isDarkMode ? 'On' : 'Off'}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-start space-x-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <Moon className="w-5 h-5 text-muted-foreground" />
                      <span>Dark Mode</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleDarkMode}
                    >
                      {isDarkMode ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full justify-start">
                      Sign Up
                    </Button>
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