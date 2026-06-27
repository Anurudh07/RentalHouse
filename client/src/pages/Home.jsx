import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Search, MapPin, Building, Sparkles, TrendingUp, ShieldCheck, HeartHandshake, Star } from 'lucide-react';
import API from '../api/axiosConfig';

const Home = () => {
  const { filters, setFilters, resetFilters } = useProperties();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search parameters local state
  const [searchParams, setSearchParams] = useState({
    city: '',
    propertyType: '',
    minRent: ''
  });

  useEffect(() => {
    // Reset filters when visiting Home
    resetFilters();
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      // Get top 3 properties sorted by rating/created
      const response = await API.get('/properties', {
        params: { limit: 3, sort: '-averageRating' }
      });
      if (response.data.success) {
        setFeatured(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching featured properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      city: searchParams.city,
      propertyType: searchParams.propertyType,
      minRent: searchParams.minRent,
      page: 1
    }));
    navigate('/properties');
  };

  const handleCategoryClick = (type) => {
    resetFilters();
    setFilters(prev => ({ ...prev, propertyType: type, page: 1 }));
    navigate('/properties');
  };

  const handleLocationClick = (city) => {
    resetFilters();
    setFilters(prev => ({ ...prev, city, page: 1 }));
    navigate('/properties');
  };

  const popularLocations = [
    { name: 'Noida', count: 12, img: 'https://images.unsplash.com/photo-1597047084897-51e81819a499?auto=format&fit=crop&w=400&q=80' },
    { name: 'Delhi', count: 15, img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80' },
    { name: 'Gurgaon', count: 8, img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mumbai', count: 18, img: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Banner Section */}
      <section 
        className="hero-section py-5 text-white d-flex align-items-center"
        style={{
          minHeight: '600px',
          background: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '0 0 var(--radius-xl) var(--radius-xl)'
        }}
      >
        <div className="container py-5 text-center">
          <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 fw-bold tracking-wide text-uppercase animate-slide-up">
            <Sparkles size={14} className="me-1" /> Discover the Art of Living
          </span>
          <h1 className="display-4 fw-extrabold mb-3 text-white animate-slide-up" style={{ fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
            Find Your Dream Home
          </h1>
          <p className="lead mb-5 text-white-50 animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Explore thousands of verified listings with premium amenities, smart pricing comparisons, and secure booking tools.
          </p>

          {/* Search Box */}
          <div className="row justify-content-center animate-slide-up">
            <div className="col-lg-9 col-xl-8">
              <form onSubmit={handleSearchSubmit} className="glass-card p-4 rounded-4 shadow-lg text-start">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small text-secondary fw-semibold">City</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 text-white-50"><MapPin size={18} /></span>
                      <select className="form-select bg-dark border-secondary text-white" name="city" value={searchParams.city} onChange={handleSearchChange} style={{ background: '#1e293b' }}>
                        <option value="">Select City</option>
                        <option value="Noida">Noida</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Gurgaon">Gurgaon</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Pune">Pune</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-secondary fw-semibold">Property Type</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 text-white-50"><Building size={18} /></span>
                      <select className="form-select bg-dark border-secondary text-white" name="propertyType" value={searchParams.propertyType} onChange={handleSearchChange} style={{ background: '#1e293b' }}>
                        <option value="">Select Type</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Independent House">Independent House</option>
                        <option value="PG">PG</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button type="submit" className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2">
                      <Search size={18} /> Search Homes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="container py-5 mt-4">
        <h2 className="text-center fw-bold mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Explore by Property Type</h2>
        <div className="row g-4 justify-content-center">
          {['Apartment', 'Villa', 'Independent House', 'PG'].map((type) => {
            const icons = {
              'Apartment': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
              'Villa': 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80',
              'Independent House': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
              'PG': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'
            };
            return (
              <div key={type} className="col-6 col-md-3">
                <div 
                  onClick={() => handleCategoryClick(type)}
                  className="card text-center border-0 hover-scale overflow-hidden cursor-pointer shadow-sm position-relative" 
                  style={{ height: '180px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                >
                  <img src={icons[type]} alt={type} className="w-100 h-100 object-fit-cover brightness-50" />
                  <div className="position-absolute top-50 start-50 translate-middle text-white w-100 px-2">
                    <h5 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{type}</h5>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-light-subtle py-5" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
        <div className="container py-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-5 gap-3">
            <div>
              <h2 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>Featured Properties</h2>
              <p className="text-secondary m-0 mt-1">Our highest-rated properties matching premium standards.</p>
            </div>
            <Link to="/properties" className="btn btn-outline-primary btn-sm px-4 py-2">View All Properties</Link>
          </div>

          {loading ? (
            <SkeletonLoader count={3} />
          ) : featured.length === 0 ? (
            <div className="text-center py-5 text-secondary">No featured listings found. Run database seeder first.</div>
          ) : (
            <div className="row g-4">
              {featured.map((property) => (
                <div key={property._id} className="col-md-4">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Locations */}
      <section className="container py-5 my-4">
        <h2 className="text-center fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Browse Popular Locations</h2>
        <p className="text-center text-secondary mb-5">Explore listings available in major urban regions.</p>
        <div className="row g-4">
          {popularLocations.map((loc) => (
            <div key={loc.name} className="col-md-3 col-sm-6">
              <div 
                onClick={() => handleLocationClick(loc.name)}
                className="card border-0 overflow-hidden hover-scale position-relative text-white cursor-pointer shadow"
                style={{ height: '220px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              >
                <img src={loc.img} alt={loc.name} className="w-100 h-100 object-fit-cover brightness-50" />
                <div className="position-absolute bottom-0 start-0 p-3">
                  <h4 className="fw-bold m-0" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{loc.name}</h4>
                  <small className="opacity-75">{loc.count} Properties</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-5 bg-primary text-white text-center" style={{ borderRadius: 'var(--radius-xl)' }}>
        <div className="container py-4">
          <div className="row g-4 justify-content-center">
            <div className="col-md-3 col-6 border-end border-white-25">
              <h2 className="display-5 fw-extrabold m-0">3,500+</h2>
              <small className="opacity-75 text-uppercase fw-bold">Verified Listings</small>
            </div>
            <div className="col-md-3 col-6 border-end border-white-25">
              <h2 className="display-5 fw-extrabold m-0">1,200+</h2>
              <small className="opacity-75 text-uppercase fw-bold">Satisfied Tenants</small>
            </div>
            <div className="col-md-3 col-6 border-end border-white-25">
              <h2 className="display-5 fw-extrabold m-0">450+</h2>
              <small className="opacity-75 text-uppercase fw-bold">Active Owners</small>
            </div>
            <div className="col-md-3 col-6">
              <h2 className="display-5 fw-extrabold m-0">99.8%</h2>
              <small className="opacity-75 text-uppercase fw-bold">Success Rate</small>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container py-5 my-5">
        <h2 className="text-center fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Why Choose RentalHouse</h2>
        <p className="text-center text-secondary mb-5">We provide the most secure, responsive, and seamless real estate renting tools.</p>
        <div className="row g-4">
          <div className="col-md-4 text-center">
            <div className="p-4 rounded-4 shadow-sm h-100 hover-scale bg-surface">
              <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-flex mb-4">
                <ShieldCheck size={32} />
              </div>
              <h5 className="fw-bold mb-3">100% Verified Listings</h5>
              <p className="text-secondary mb-0">Every property listing is checked and approved by our admins to block fraudulent postings.</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className="p-4 rounded-4 shadow-sm h-100 hover-scale bg-surface">
              <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-flex mb-4">
                <TrendingUp size={32} />
              </div>
              <h5 className="fw-bold mb-3">Dynamic Analytics</h5>
              <p className="text-secondary mb-0">Compare rents, sizes, and amenities side-by-side to make the smartest decisions.</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className="p-4 rounded-4 shadow-sm h-100 hover-scale bg-surface">
              <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-flex mb-4">
                <HeartHandshake size={32} />
              </div>
              <h5 className="fw-bold mb-3">Zero Brokerage Options</h5>
              <p className="text-secondary mb-0">Direct communication tools between tenants and landlords to save on hefty broker commissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-5 mb-5">
        <h2 className="text-center fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Client Testimonials</h2>
        <p className="text-center text-secondary mb-5 font-medium">Hear directly from renters and homeowners who use our platform daily.</p>
        <div className="row g-4">
          {[
            { name: 'Sameer Sen', role: 'Tenant', text: 'I found an apartment in Gurgaon within 3 days. The Leaflet map integration helped me locate listings near my office, and side-by-side compare was crucial!', rating: 5 },
            { name: 'Priya Sharma', role: 'Property Owner', text: 'Listing my villas was extremely easy. The multi-image upload with compression works great, and I received inquiries with email alerts instantly.', rating: 5 },
            { name: 'Karan Mehta', role: 'Tenant', text: 'The interface is stunning. Moving between light and dark modes is super smooth, and not having dummy values makes searching very reliable.', rating: 5 }
          ].map((test, index) => (
            <div key={index} className="col-md-4">
              <div className="card p-4 h-100 shadow-sm glass-card border-0">
                <div className="d-flex gap-1 text-warning mb-3">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="var(--warning)" className="text-warning" />
                  ))}
                </div>
                <p className="fst-italic text-secondary mb-4">"{test.text}"</p>
                <div className="d-flex align-items-center gap-2 mt-auto">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h6 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>{test.name}</h6>
                    <small className="text-muted">{test.role}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
