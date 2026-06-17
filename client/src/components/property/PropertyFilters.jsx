import React, { useState } from 'react';
import { useProperties } from '../../context/PropertyContext';
import { Filter, RotateCcw, Search } from 'lucide-react';

const PropertyFilters = ({ onSearchTrigger }) => {
  const { filters, setFilters, resetFilters } = useProperties();
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const cities = ['Noida', 'Delhi', 'Gurgaon', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];
  const propertyTypes = ['Apartment', 'Villa', 'Independent House', 'PG'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: localSearch }));
    if (onSearchTrigger) onSearchTrigger();
  };

  const handleReset = () => {
    setLocalSearch('');
    resetFilters();
    if (onSearchTrigger) onSearchTrigger();
  };

  const handleApplyFilters = () => {
    if (onSearchTrigger) onSearchTrigger();
  };

  return (
    <div className="card p-4 glass-card border-0 shadow-sm mb-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
        <h5 className="m-0 fw-bold d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
          <Filter size={18} className="text-primary" /> Filters
        </h5>
        <button 
          onClick={handleReset} 
          className="btn btn-link p-0 text-muted d-flex align-items-center gap-1 text-decoration-none hover-scale"
          style={{ fontSize: '0.85rem' }}
        >
          <RotateCcw size={14} /> Reset All
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <label className="form-label fw-semibold small text-secondary">Search Keywords</label>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="e.g. Garden, Pool, Lift..." 
            className="form-control" 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary px-3">
            <Search size={16} />
          </button>
        </div>
      </form>

      {/* City Selection */}
      <div className="mb-3">
        <label className="form-label fw-semibold small text-secondary">Location / City</label>
        <select 
          className="form-select" 
          name="city" 
          value={filters.city} 
          onChange={handleChange}
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Property Type */}
      <div className="mb-3">
        <label className="form-label fw-semibold small text-secondary">Property Type</label>
        <select 
          className="form-select" 
          name="propertyType" 
          value={filters.propertyType} 
          onChange={handleChange}
        >
          <option value="">All Types</option>
          {propertyTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Rent range */}
      <div className="row g-2 mb-3">
        <label className="form-label fw-semibold small text-secondary col-12 m-0">Monthly Rent (₹)</label>
        <div className="col-6">
          <input 
            type="number" 
            name="minRent" 
            placeholder="Min" 
            className="form-control" 
            value={filters.minRent} 
            onChange={handleChange}
          />
        </div>
        <div className="col-6">
          <input 
            type="number" 
            name="maxRent" 
            placeholder="Max" 
            className="form-control" 
            value={filters.maxRent} 
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Bedrooms (BHK) */}
      <div className="mb-4">
        <label className="form-label fw-semibold small text-secondary">Bedrooms (BHK)</label>
        <select 
          className="form-select" 
          name="bedrooms" 
          value={filters.bedrooms} 
          onChange={handleChange}
        >
          <option value="">Any BHK</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4+ BHK</option>
        </select>
      </div>

      {/* Sort options */}
      <div className="mb-4">
        <label className="form-label fw-semibold small text-secondary">Sort By</label>
        <select 
          className="form-select" 
          name="sort" 
          value={filters.sort} 
          onChange={handleChange}
        >
          <option value="-createdAt">Newest First</option>
          <option value="rent">Rent: Low to High</option>
          <option value="-rent">Rent: High to Low</option>
          <option value="area">Size: Low to High</option>
          <option value="-area">Size: High to Low</option>
          <option value="-averageRating">Ratings: High to Low</option>
        </select>
      </div>

      {/* Apply Filters CTA */}
      <button 
        type="button" 
        onClick={handleApplyFilters} 
        className="btn btn-primary w-100 mt-2 py-2 fw-bold"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default PropertyFilters;
