import React, { useEffect, useState } from 'react';
import { useProperties } from '../context/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import PropertyFilters from '../components/property/PropertyFilters';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Grid, List } from 'lucide-react';

const Properties = () => {
  const { 
    properties, 
    loading, 
    error, 
    hasMore, 
    fetchProperties, 
    setProperties,
    setFilters
  } = useProperties();
  const [viewType, setViewType] = useState('grid'); // 'grid' | 'list'

  // Trigger search on mount/reset
  useEffect(() => {
    handleSearch(true);
  }, []);

  const handleSearch = (reset = true) => {
    if (reset) {
      // Clear current listings before reload
      setProperties([]);
      setFilters(prev => ({ ...prev, page: 1 }));
    }
    // Set a slight timeout to ensure context states update
    setTimeout(() => {
      fetchProperties(reset);
    }, 50);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      handleSearch(false);
    }
  };

  return (
    <div className="container py-5 mt-3">
      <div className="row">
        {/* Title & Controls */}
        <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="fw-extrabold m-0" style={{ fontFamily: 'var(--font-heading)' }}>Search Directory</h1>
            <p className="text-secondary m-0 mt-1">Found {properties.length} active rental properties matching your search.</p>
          </div>

          {/* Grid/List Layout Toggler */}
          <div className="d-flex align-items-center gap-2">
            <button 
              onClick={() => setViewType('grid')} 
              className={`btn p-2 rounded-3 hover-scale border-0 ${viewType === 'grid' ? 'btn-primary' : 'bg-surface'}`}
              style={{ color: viewType === 'grid' ? '#fff' : 'var(--text-secondary)' }}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewType('list')} 
              className={`btn p-2 rounded-3 hover-scale border-0 ${viewType === 'list' ? 'btn-primary' : 'bg-surface'}`}
              style={{ color: viewType === 'list' ? '#fff' : 'var(--text-secondary)' }}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar Filters */}
        <div className="col-lg-4 col-xl-3 mb-4">
          <PropertyFilters onSearchTrigger={() => handleSearch(true)} />
        </div>

        {/* Listings Area */}
        <div className="col-lg-8 col-xl-9">
          {error && (
            <div className="alert alert-danger shadow-sm py-3 mb-4" role="alert">
              {error}
            </div>
          )}

          {properties.length === 0 && !loading ? (
            <div className="text-center py-5 card glass-card border-0">
              <h4 className="fw-bold text-muted mb-2">No Properties Found</h4>
              <p className="text-secondary m-0">Try clearing filters or adjusting your keywords/rent parameters.</p>
            </div>
          ) : (
            <>
              {/* Properties Grid/List wrapper */}
              <div className="row g-4">
                {properties.map((property) => (
                  <div 
                    key={property._id} 
                    className={viewType === 'grid' ? 'col-md-6 col-xl-4' : 'col-12'}
                  >
                    <PropertyCard property={property} viewType={viewType} />
                  </div>
                ))}
              </div>

              {/* Loader placeholder cards */}
              {loading && (
                <div className="mt-4">
                  <SkeletonLoader count={3} />
                </div>
              )}

              {/* Load More Button */}
              {hasMore && !loading && properties.length > 0 && (
                <div className="text-center mt-5">
                  <button 
                    onClick={handleLoadMore} 
                    className="btn btn-outline-primary px-5 py-2.5 fw-bold"
                  >
                    Load More Listings
                  </button>
                </div>
              )}

              {!hasMore && properties.length > 0 && (
                <div className="text-center mt-5 text-muted small">
                  You've viewed all properties matching your criteria.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
