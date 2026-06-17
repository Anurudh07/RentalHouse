import React, { createContext, useState, useContext } from 'react';
import API from '../api/axiosConfig';

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    minRent: '',
    maxRent: '',
    bedrooms: '',
    search: '',
    sort: '-createdAt',
    limit: 10,
    page: 1
  });
  const [hasMore, setHasMore] = useState(true);

  const fetchProperties = async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const pageToFetch = reset ? 1 : filters.page;
      const params = {
        ...filters,
        page: pageToFetch
      };
      
      // Clean up empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await API.get('/properties', { params });
      if (response.data.success) {
        const fetchedData = response.data.data;
        if (reset) {
          setProperties(fetchedData);
        } else {
          setProperties(prev => [...prev, ...fetchedData]);
        }
        
        // Check if we reached the end for infinite scroll
        if (fetchedData.length < (params.limit || 10)) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setFilters(prev => ({ ...prev, page: pageToFetch + 1 }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch properties.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyDetails = async (id) => {
    setLoading(true);
    setError(null);
    setPropertyDetails(null);
    try {
      const response = await API.get(`/properties/${id}`);
      if (response.data.success) {
        setPropertyDetails(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load property details.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleCompare = (property) => {
    setCompareList(prev => {
      const exists = prev.some(item => item._id === property._id);
      if (exists) {
        return prev.filter(item => item._id !== property._id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 properties at a time.');
          return prev;
        }
        return [...prev, property];
      }
    });
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      propertyType: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      search: '',
      sort: '-createdAt',
      limit: 10,
      page: 1
    });
    setHasMore(true);
  };

  return (
    <PropertyContext.Provider value={{
      properties,
      propertyDetails,
      loading,
      error,
      compareList,
      filters,
      hasMore,
      setProperties,
      setFilters,
      fetchProperties,
      fetchPropertyDetails,
      toggleCompare,
      clearCompare,
      resetFilters
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => useContext(PropertyContext);
