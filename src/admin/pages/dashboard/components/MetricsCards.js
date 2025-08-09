import React from 'react';
import styles from './MetricsCards.module.css';

const MetricsCards = ({ metrics }) => {
  const cards = [
    {
      title: "Today's Orders",
      value: metrics.todayOrders,
      icon: '📋',
      color: 'blue',
      trend: metrics.todayOrders > 0 ? '+12%' : '0%',
      trendUp: metrics.todayOrders > 0
    },
    {
      title: "Today's Revenue",
      value: `₹${metrics.todayRevenue.toLocaleString('en-IN')}`,
      icon: '💰',
      color: 'green',
      trend: metrics.todayRevenue > 0 ? '+8%' : '0%',
      trendUp: metrics.todayRevenue > 0
    },
    {
      title: "Active Orders",
      value: metrics.activeOrders,
      icon: '🔥',
      color: 'orange',
      trend: 'Live',
      isLive: true
    },
    {
      title: "Avg Order Value",
      value: `₹${Math.round(metrics.avgOrderValue)}`,
      icon: '📊',
      color: 'purple',
      trend: metrics.avgOrderValue > 0 ? '+5%' : '0%',
      trendUp: metrics.avgOrderValue > 0
    },
    // ✅ NEW: MealBoxes metrics cards
    {
      title: "Total MealBoxes",
      value: metrics.totalMealBoxes,
      icon: '🍱',
      color: 'teal',
      trend: `${metrics.activeMealBoxes} active`,
      isInfo: true
    },
    {
      title: "MealBox Types",
      value: `${metrics.activeMealBoxes}/${metrics.totalMealBoxes}`,
      icon: '📦',
      color: 'indigo',
      trend: 'Active/Total',
      isInfo: true
    }
  ];

  if (metrics.loading) {
    return (
      <div className={styles.metricsGrid}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={`${styles.metricCard} ${styles.loading}`}>
            <div className={styles.loadingShimmer}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.metricsGrid}>
      {cards.map((card, index) => (
        <div key={index} className={`${styles.metricCard} ${styles[card.color]}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>{card.icon}</span>
            <div className={styles.cardTrend}>
              {card.isLive ? (
                <span className={`${styles.trend} ${styles.live}`}>
                  <span className={styles.liveDot}></span>
                  {card.trend}
                </span>
              ) : card.isInfo ? (
                <span className={`${styles.trend} ${styles.info}`}>
                  {card.trend}
                </span>
              ) : (
                <span className={`${styles.trend} ${card.trendUp ? styles.up : styles.down}`}>
                  {card.trendUp ? '↗' : '↘'} {card.trend}
                </span>
              )}
            </div>
          </div>
          
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <div className={styles.cardValue}>{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
