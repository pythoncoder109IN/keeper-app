import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_API}/notes`,
        { withCredentials: true }
      );
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/notes`,
        noteData,
        { withCredentials: true }
      );
      
      if (data.success) {
        setNotes(prev => [data.note, ...prev]);
        return { success: true, note: data.note };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error creating note:', error);
      return { success: false, message: 'Failed to create note' };
    }
  };

  const updateNote = async (noteId, noteData) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_SERVER_API}/notes/${noteId}`,
        noteData,
        { withCredentials: true }
      );
      
      if (data.success) {
        setNotes(prev => prev.map(note => 
          note._id === noteId ? { ...note, ...data.note } : note
        ));
        return { success: true, note: data.note };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error updating note:', error);
      return { success: false, message: 'Failed to update note' };
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_SERVER_API}/notes/${noteId}`,
        { withCredentials: true }
      );
      
      if (data.success) {
        setNotes(prev => prev.filter(note => note._id !== noteId));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      return { success: false, message: 'Failed to delete note' };
    }
  };

  const toggleFavorite = async (noteId) => {
    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_SERVER_API}/notes/${noteId}/favorite`,
        {},
        { withCredentials: true }
      );
      
      if (data.success) {
        setNotes(prev => prev.map(note => 
          note._id === noteId ? { ...note, isFavorite: data.isFavorite } : note
        ));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, message: 'Failed to update favorite' };
    }
  };

  const shareNote = async (noteId, shareData) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/notes/${noteId}/share`,
        shareData,
        { withCredentials: true }
      );
      
      return { success: data.success, message: data.message, shareUrl: data.shareUrl };
    } catch (error) {
      console.error('Error sharing note:', error);
      return { success: false, message: 'Failed to share note' };
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = !filterFavorites || note.isFavorite;
    return matchesSearch && matchesFavorite;
  });

  const getStats = () => {
    return {
      total: notes.length,
      favorites: notes.filter(note => note.isFavorite).length,
      withImages: notes.filter(note => note.images && note.images.length > 0).length,
      withDrawings: notes.filter(note => note.drawing).length,
    };
  };

  const value = {
    notes: filteredNotes,
    allNotes: notes,
    loading,
    searchTerm,
    setSearchTerm,
    filterFavorites,
    setFilterFavorites,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    shareNote,
    getStats,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};