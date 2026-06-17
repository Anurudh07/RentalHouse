import React from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { Shuffle, Trash2, ArrowLeft, Star, ExternalLink } from 'lucide-react';

const PropertyCompare = () => {
  const { compareList, toggleCompare, clearCompare } = useProperties();

  const getImageUrl = (property) => {
    if (property.images && property.images.length > 0) {
      const img = property.images[0];
      return img.startsWith('http') ? img : `/${img}`;
    }
    return 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=85';
  };

  if (compareList.length === 0) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="card p-5 glass-card border-0 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Shuffle size={48} className="text-primary mb-3 mx-auto" />
          <h3 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>No Properties to Compare</h3>
          <p className="text-secondary mb-4">You can select up to 3 properties from our directory to compare them side-by-side.</p>
          <Link to="/properties" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <ArrowLeft size={16} /> Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-3 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-2">
        <div>
          <h1 className="fw-extrabold m-0" style={{ fontFamily: 'var(--font-heading)' }}>Compare Listings</h1>
          <p className="text-secondary m-0 mt-1">Analyzing {compareList.length} properties side-by-side.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/properties" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
            <ArrowLeft size={16} /> Back
          </Link>
          <button onClick={clearCompare} className="btn btn-danger btn-sm d-flex align-items-center gap-1">
            <Trash2 size={16} /> Clear Comparison
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden bg-surface mb-5">
        <div className="table-responsive">
          <table className="table table-compare table-bordered mb-0 align-middle text-center">
            <thead>
              <tr>
                <th scope="col" className="text-start" style={{ width: '220px', minWidth: '180px' }}>Listing Specs</th>
                {compareList.map((property) => (
                  <th key={property._id} scope="col" style={{ minWidth: '250px' }}>
                    <div className="position-relative py-3">
                      <button 
                        onClick={() => toggleCompare(property)}
                        className="btn btn-sm btn-link text-danger p-0 position-absolute"
                        style={{ top: '0', right: '0' }}
                        title="Remove from comparison"
                      >
                        <Trash2 size={16} />
                      </button>
                      <img 
                        src={getImageUrl(property)} 
                        alt={property.title} 
                        className="rounded object-fit-cover mb-2" 
                        style={{ width: '100%', height: '140px' }}
                      />
                      <h6 className="fw-bold text-truncate mb-1 px-2">{property.title}</h6>
                      <span className="badge bg-primary text-uppercase">{property.propertyType}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Rent */}
              <tr>
                <td className="text-start fw-semibold bg-light-subtle">Monthly Rent</td>
                {compareList.map((property) => (
                  <td key={property._id} className="fw-bold text-primary">
                    ₹{property.rent.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* Deposit */}
              <tr>
                <td className="text-start fw-semibold bg-light-subtle">Security Deposit</td>
                {compareList.map((property) => (
                  <td key={property._id}>
                    ₹{property.deposit.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* Bedrooms */}
              <tr>
                <td className="text-start fw-semibold bg-light-subtle">Bedrooms</td>
                {compareList.map((property) => (
                  <td key={property._id} className="fw-semibold">
                    {property.bedrooms} BHK
                  </td>
                ))}
              </tr>

              {/* Bathrooms */}
              <tr>
                <td className="text-start fw-semibold bg-light-subtle">Bathrooms</td>
                {compareList.map((property) => (
                  <td key={property._id}>
                    {property.bathrooms} Baths
                  </td>
                ))}
              </tr>

              {/* Area */}
              <tr>
                <td className="text-start fw-semibold bg-light-subtle">Property Size</td>
                {compareList.map((property) => (
                  <td key={property._id}>
                    {property.area} sqft
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr>
                <td className="text-start fw-semibold bg-light-subtle">Location</td>
                {compareList.map((property) => (
                  <td key={property._id} className="small text-secondary">
                    {property.address}, {property.city}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="text-start fw-semibold bg-light-subtle">Average Rating</td>
                {compareList.map((property) => (
                  <td key={property._id}>
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <Star size={16} fill="var(--warning)" className="text-warning" />
                      <span className="fw-bold">{property.averageRating || 'New'}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              <tr>
                <td className="text-start fw-semibold bg-light-subtle">Key Amenities</td>
                {compareList.map((property) => (
                  <td key={property._id} className="small text-secondary">
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      {property.amenities && property.amenities.length > 0 ? (
                        property.amenities.slice(0, 4).map((am, i) => (
                          <span key={i} className="badge bg-secondary text-secondary-emphasis">{am}</span>
                        ))
                      ) : (
                        <span>Standard</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Action Link */}
              <tr>
                <td className="text-start fw-semibold bg-light-subtle">Actions</td>
                {compareList.map((property) => (
                  <td key={property._id}>
                    <Link to={`/properties/${property._id}`} className="btn btn-primary btn-sm d-flex align-items-center justify-content-center gap-1">
                      View Details <ExternalLink size={14} />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PropertyCompare;
