import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoriteContext';
import { useProperties } from '../../context/PropertyContext';
import { Heart, Maximize2, BedDouble, Bath, Square, MapPin, Star, Shuffle } from 'lucide-react';

const PropertyCard = ({ property, viewType = 'grid' }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, compareList } = useProperties();

  const isFav = isFavorite(property._id);
  const isCompared = compareList.some(item => item._id === property._id);

  // Get image URL - handles cloud vs. local backend fallback
  const getImageUrl = () => {
    if (property.images && property.images.length > 0) {
      const img = property.images[0];
      return img.startsWith('http') ? img : `/${img}`;
    }
    // Fallback image using Unsplash
    return 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=85';
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property._id);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(property);
  };

  const isGrid = viewType === 'grid';

  return (
    <div className={`card h-100 overflow-hidden ${!isGrid ? 'flex-md-row' : ''}`} style={{ border: '1px solid var(--border-color)' }}>
      {/* Property Image container */}
      <div className="position-relative" style={{ height: '240px', width: isGrid ? '100%' : '350px', flexShrink: 0 }}>
        <img 
          src={getImageUrl()} 
          alt={property.title} 
          className="w-100 h-100 object-fit-cover hover-scale"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=85';
          }}
        />
        <div className="property-badge">{property.propertyType}</div>
        
        {/* Wishlist Button */}
        <button 
          onClick={handleFavoriteClick}
          className="btn p-2 rounded-circle glass-card position-absolute"
          style={{ 
            top: '15px', 
            right: '15px', 
            zIndex: 10,
            border: 'none',
            color: isFav ? 'var(--danger)' : 'white',
            background: isFav ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.4)'
          }}
          title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={isFav ? 'var(--danger)' : 'transparent'} />
        </button>

        {/* Compare Button */}
        <button 
          onClick={handleCompareClick}
          className="btn p-2 rounded-circle glass-card position-absolute"
          style={{ 
            top: '65px', 
            right: '15px', 
            zIndex: 10,
            border: 'none',
            color: isCompared ? 'var(--primary)' : 'white',
            background: isCompared ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.4)'
          }}
          title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
        >
          <Shuffle size={18} />
        </button>
      </div>

      {/* Property Info */}
      <div className="card-body d-flex flex-column justify-content-between p-4">
        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-primary fw-bold" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
              ₹{property.rent.toLocaleString('en-IN')}<span className="text-muted fw-normal" style={{ fontSize: '0.85rem' }}>/mo</span>
            </span>
            <div className="d-flex align-items-center gap-1">
              <Star size={16} className="text-warning" fill="var(--warning)" />
              <span className="fw-semibold text-primary">{property.averageRating || 'New'}</span>
            </div>
          </div>

          <h5 className="card-title text-truncate mb-2" style={{ fontWeight: '600' }} title={property.title}>
            <Link to={`/properties/${property._id}`} className="text-decoration-none" style={{ color: 'var(--text-primary)' }}>
              {property.title}
            </Link>
          </h5>

          <p className="text-secondary d-flex align-items-center gap-1 mb-3" style={{ fontSize: '0.9rem' }}>
            <MapPin size={16} className="text-muted flex-shrink-0" />
            <span className="text-truncate">{property.address}, {property.city}</span>
          </p>
        </div>

        <div>
          {/* Key Amenities Indicators */}
          <div className="d-flex justify-content-between pt-3 border-top gap-2 text-secondary" style={{ fontSize: '0.85rem', borderColor: 'var(--border-color)' }}>
            <span className="d-flex align-items-center gap-1">
              <BedDouble size={16} /> {property.bedrooms} BHK
            </span>
            <span className="d-flex align-items-center gap-1">
              <Bath size={16} /> {property.bathrooms} Bath
            </span>
            <span className="d-flex align-items-center gap-1">
              <Square size={16} /> {property.area} sqft
            </span>
          </div>

          {/* Details CTA Link */}
          <div className="mt-3">
            <Link to={`/properties/${property._id}`} className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1">
              <Maximize2 size={14} /> View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
