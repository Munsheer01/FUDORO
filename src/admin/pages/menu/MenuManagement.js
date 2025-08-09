import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import MenuFilters from './components/MenuFilters';
import PlatterCard from './components/PlatterCard';
import BulkActions from './components/BulkActions';
import styles from './MenuManagement.module.css';

const MenuManagement = () => {
  const [platters, setPlatters] = useState([]);
  const [filteredPlatters, setFilteredPlatters] = useState([]);
  const [selectedPlatters, setSelectedPlatters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cuisine: 'all',
    mealType: 'all',
    status: 'all',
    search: ''
  });

  useEffect(() => {
    // Real-time platters subscription
    const plattersQuery = collection(db, 'Enhanced_Authentic_Platters');

    const unsubscribe = onSnapshot(plattersQuery, (snapshot) => {
      const plattersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPlatters(plattersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [platters, filters]);

  const applyFilters = () => {
    let filtered = [...platters];

    if (filters.cuisine !== 'all') {
      filtered = filtered.filter(platter => platter.cuisine === filters.cuisine);
    }

    if (filters.mealType !== 'all') {
      filtered = filtered.filter(platter => platter.mealType === filters.mealType);
    }

    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(platter => platter.isActive === true);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(platter => platter.isActive === false);
      }
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(platter => 
        platter.name.toLowerCase().includes(searchTerm) ||
        platter.description.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPlatters(filtered);
  };

  const togglePlatterAvailability = async (platterId, newStatus) => {
    try {
      await updateDoc(doc(db, 'Enhanced_Authentic_Platters', platterId), {
        isActive: newStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating platter availability:', error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedPlatters.length === 0) {
      alert('Please select platters first');
      return;
    }

    try {
      const promises = selectedPlatters.map(platterId => {
        if (action === 'activate') {
          return updateDoc(doc(db, 'Enhanced_Authentic_Platters', platterId), {
            isActive: true,
            updatedAt: new Date()
          });
        } else if (action === 'deactivate') {
          return updateDoc(doc(db, 'Enhanced_Authentic_Platters', platterId), {
            isActive: false,
            updatedAt: new Date()
          });
        }
      });

      await Promise.all(promises);
      setSelectedPlatters([]);
      
      alert(`Successfully ${action}d ${selectedPlatters.length} platter(s)`);
    } catch (error) {
      console.error('Error with bulk action:', error);
      alert('Error updating platters');
    }
  };

  const handlePlatterSelect = (platterId) => {
    setSelectedPlatters(prev => {
      if (prev.includes(platterId)) {
        return prev.filter(id => id !== platterId);
      } else {
        return [...prev, platterId];
      }
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className={styles.menuManagement}>
      <div className={styles.menuHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Menu Management</h1>
          <div className={styles.menuStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{platters.length}</span>
              <span className={styles.statLabel}>Total Platters</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {platters.filter(p => p.isActive).length}
              </span>
              <span className={styles.statLabel}>Active</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {platters.filter(p => !p.isActive).length}
              </span>
              <span className={styles.statLabel}>Inactive</span>
            </div>
          </div>
        </div>
      </div>

      <MenuFilters filters={filters} onFilterChange={setFilters} />

      {selectedPlatters.length > 0 && (
        <BulkActions
          selectedCount={selectedPlatters.length}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedPlatters([])}
        />
      )}

      <div className={styles.plattersGrid}>
        {filteredPlatters.map(platter => (
          <PlatterCard
            key={platter.id}
            platter={platter}
            isSelected={selectedPlatters.includes(platter.id)}
            onToggleAvailability={togglePlatterAvailability}
            onSelect={handlePlatterSelect}
          />
        ))}
      </div>

      {filteredPlatters.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🍽️</div>
          <h3>No platters found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
