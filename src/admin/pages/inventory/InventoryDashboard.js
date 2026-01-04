import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import InventoryItem from './components/InventoryItem';
import LowStockAlerts from './components/LowStockAlerts';
import InventoryFilters from './components/InventoryFilters';
import AddInventoryModal from './components/AddInventoryModal';
import styles from './InventoryDashboard.module.css';

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });

  useEffect(() => {
    // Real-time inventory subscription
    const inventoryQuery = collection(db, 'inventory');

    const unsubscribe = onSnapshot(inventoryQuery, (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setInventory(inventoryData);
      
      // Filter low stock items (less than minimum threshold)
      const lowStock = inventoryData.filter(item => 
        item.currentStock <= (item.minThreshold || 10)
      );
      setLowStockItems(lowStock);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, filters]);

  const applyFilters = () => {
    let filtered = [...inventory];

    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.status !== 'all') {
      if (filters.status === 'low') {
        filtered = filtered.filter(item => item.currentStock <= (item.minThreshold || 10));
      } else if (filters.status === 'good') {
        filtered = filtered.filter(item => item.currentStock > (item.minThreshold || 10));
      }
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredInventory(filtered);
  };

  const updateStock = async (itemId, newStock, action, notes = '') => {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;

      await updateDoc(doc(db, 'inventory', itemId), {
        currentStock: newStock,
        lastUpdated: new Date(),
        lastAction: action
      });

      // Log stock movement
      await addDoc(collection(db, 'inventory_logs'), {
        itemId,
        itemName: item.name,
        action,
        previousStock: item.currentStock,
        newStock,
        difference: newStock - item.currentStock,
        notes,
        timestamp: new Date(),
        updatedBy: 'admin' // In real app, get from auth context
      });

    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const addInventoryItem = async (itemData) => {
    try {
      await addDoc(collection(db, 'inventory'), {
        ...itemData,
        createdAt: new Date(),
        lastUpdated: new Date(),
        createdBy: 'admin'
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding inventory item:', error);
    }
  };

  const getInventoryStats = () => {
    return {
      totalItems: inventory.length,
      lowStockCount: lowStockItems.length,
      totalValue: inventory.reduce((sum, item) => sum + (item.currentStock * (item.unitPrice || 0)), 0),
      categories: [...new Set(inventory.map(item => item.category))].length
    };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  const stats = getInventoryStats();

  return (
    <div className={styles.inventoryDashboard}>
      <div className={styles.inventoryHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Inventory Management</h1>
          <div className={styles.inventoryStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{stats.totalItems}</span>
              <span className={styles.statLabel}>Total Items</span>
            </div>
            <div className={styles.stat}>
              <span className={`${styles.statNumber} ${stats.lowStockCount > 0 ? styles.warning : ''}`}>
                {stats.lowStockCount}
              </span>
              <span className={styles.statLabel}>Low Stock</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                ₹{stats.totalValue.toLocaleString('en-IN')}
              </span>
              <span className={styles.statLabel}>Total Value</span>
            </div>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            + Add Item
          </button>
          <button className={styles.exportButton}>
            📤 Export
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <LowStockAlerts items={lowStockItems} />
      )}

      <InventoryFilters filters={filters} onFilterChange={setFilters} />

      <div className={styles.inventoryGrid}>
        {filteredInventory.map(item => (
          <InventoryItem
            key={item.id}
            item={item}
            onUpdateStock={updateStock}
          />
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>No inventory items found</h3>
          <p>Add items to start tracking your inventory.</p>
          <button 
            className={styles.addFirstItem}
            onClick={() => setShowAddModal(true)}
          >
            Add First Item
          </button>
        </div>
      )}

      {/* Add Inventory Modal */}
      {showAddModal && (
        <AddInventoryModal
          onClose={() => setShowAddModal(false)}
          onAdd={addInventoryItem}
        />
      )}
    </div>
  );
};

export default InventoryDashboard;
