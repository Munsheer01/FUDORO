import React from "react";

const LoadingScreen = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A5247 0%, #0F4B2E 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center'
    }}>
      <div>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #EDD49B',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 2rem'
        }}></div>
        <h2 style={{ fontSize: '2rem', color: '#EDD49B', marginBottom: '0.5rem' }}>
          🍽️ FUDORO
        </h2>
        <p style={{ opacity: 0.8, fontSize: '1rem' }}>
          Loading Admin Dashboard...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
