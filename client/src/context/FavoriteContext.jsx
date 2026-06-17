import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { useAuth } from './AuthContext';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'tenant') {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await API.get('/favorites');
      if (response.data.success) {
        setFavorites(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.some(fav => {
      const pId = typeof fav.propertyId === 'object' ? fav.propertyId._id : fav.propertyId;
      return pId === propertyId;
    });
  };

  const toggleFavorite = async (propertyId) => {
    if (!user) {
      alert('Please log in to add properties to your wishlist.');
      return false;
    }
    if (user.role !== 'tenant') {
      alert('Only tenants can wishlist properties.');
      return false;
    }

    try {
      if (isFavorite(propertyId)) {
        // Find favorite object ID
        const favObject = favorites.find(fav => {
          const pId = typeof fav.propertyId === 'object' ? fav.propertyId._id : fav.propertyId;
          return pId === propertyId;
        });
        
        if (favObject) {
          const response = await API.delete(`/favorites/${favObject._id}`);
          if (response.data.success) {
            setFavorites(prev => prev.filter(fav => fav._id !== favObject._id));
            return true;
          }
        }
      } else {
        const response = await API.post('/favorites', { propertyId });
        if (response.data.success) {
          setFavorites(prev => [...prev, response.data.data]);
          return true;
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
    return false;
  };

  return (
    <FavoriteContext.Provider value={{
      favorites,
      loading,
      fetchFavorites,
      isFavorite,
      toggleFavorite
    }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoriteContext);
