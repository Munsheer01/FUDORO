import React from 'react';

const LowStockAlerts = ({ items = [] }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>⚠️ Low Stock Alerts</h3>
      {items.map(item => (
        <div key={item.id} style={{ padding: '5px 0' }}>
          <strong>{item.name}</strong>: {item.currentStock} {item.unit} (Min: {item.minThreshold})
        </div>
      ))}
    </div>
  );
};

export default LowStockAlerts;
