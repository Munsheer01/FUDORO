import React from 'react';

const RecentOrders = ({ orders = [] }) => {
  if (orders.length === 0) {
    return <div>No recent orders</div>;
  }

  return (
    <div>
      <h3>📋 Recent Orders</h3>
      {orders.map(order => (
        <div key={order.id} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}>
          <strong>#{order.id?.slice(-6)}</strong> - {order.customerInfo?.name} - ₹{order.totalAmount}
        </div>
      ))}
    </div>
  );
};

export default RecentOrders;
