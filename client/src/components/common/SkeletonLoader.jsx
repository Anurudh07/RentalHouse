import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const shimmerClass = "bg-secondary opacity-25 placeholder-glow";
  
  const renderCard = () => (
    <div className="card h-100 overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
      <div className="placeholder-glow" style={{ height: '220px', background: 'var(--bg-secondary)', position: 'relative' }}>
        <span className="placeholder col-12 h-100"></span>
      </div>
      <div className="card-body">
        <h5 className="card-title placeholder-glow">
          <span className="placeholder col-8"></span>
        </h5>
        <p className="card-text placeholder-glow">
          <span className="placeholder col-4 me-2"></span>
          <span className="placeholder col-6"></span>
        </p>
        <div className="d-flex justify-content-between pt-3 border-top mt-3">
          <span className="placeholder col-3"></span>
          <span className="placeholder col-3"></span>
          <span className="placeholder col-3"></span>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="col-md-3">
          <div className="card p-4 glass-card border-0">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="placeholder col-6 mb-2"></span>
                <h3 className="placeholder-glow m-0"><span className="placeholder col-10"></span></h3>
              </div>
              <div className="rounded-circle placeholder-glow" style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetails = () => (
    <div className="row g-5">
      <div className="col-lg-8">
        <div className="placeholder-glow mb-4" style={{ height: '400px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <span className="placeholder col-12 h-100"></span>
        </div>
        <h2 className="placeholder-glow"><span className="placeholder col-6"></span></h2>
        <p className="placeholder-glow"><span className="placeholder col-4"></span></p>
        <hr />
        <div className="placeholder-glow">
          <span className="placeholder col-12 mb-2"></span>
          <span className="placeholder col-10 mb-2"></span>
          <span className="placeholder col-8"></span>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card p-4">
          <span className="placeholder col-10 mb-3"></span>
          <span className="placeholder col-12 mb-3 h-50"></span>
          <span className="placeholder col-6 mb-3"></span>
          <span className="placeholder col-12 btn btn-primary disabled"></span>
        </div>
      </div>
    </div>
  );

  if (type === 'stats') return renderStats();
  if (type === 'details') return renderDetails();

  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="col-md-4">
          {renderCard()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
