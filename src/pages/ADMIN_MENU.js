import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./ADMIN_MENU.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

function AdminMenu() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", imageUrl: "", tags: [], is_active: true });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", description: "", imageUrl: "", tags: [], is_active: true });
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [categoryEdit, setCategoryEdit] = useState({}); // {menuId, catKey, value}
  const [newCategory, setNewCategory] = useState({}); // {menuId, key, value}
  const [itemEdit, setItemEdit] = useState({}); // {menuId, catKey, idx, value}
  const [newItem, setNewItem] = useState({}); // {menuId, catKey, value}
  const [extraItemEdit, setExtraItemEdit] = useState({}); // {menuId, idx, value}
  const [newExtraItem, setNewExtraItem] = useState({}); // {menuId, value}
  const [pickleEdit, setPickleEdit] = useState({}); // {menuId, idx, value}
  const [newPickle, setNewPickle] = useState({}); // {menuId, value}
  const [tagInput, setTagInput] = useState("");

  // Check admin role
  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims.role === "admin");
      }
    }
    checkAdmin();
  }, [user]);

  // Fetch menus
  const fetchMenus = async () => {
    const snapshot = await getDocs(collection(db, "Authentic Platters"));
    setMenus(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Add menu item
  const handleAdd = async (e) => {
    e.preventDefault();
    let price = form.price;
    if (typeof price === "string" && price.includes("-")) {
      const [min, max] = price.split("-").map(Number);
      price = { min, max };
    } else if (!isNaN(Number(price))) {
      price = Number(price);
    }
    await addDoc(collection(db, "Authentic Platters"), {
      ...form,
      price,
      is_active: form.is_active,
      tags: form.tags,
    });
    setForm({ name: "", price: "", description: "", imageUrl: "", tags: [], is_active: true });
    fetchMenus();
  };

  // Start editing
  const handleEditStart = (menu) => {
    setEditId(menu.id);
    setEditForm({
      name: menu.name,
      price: typeof menu.price === "object" ? `${menu.price.min}-${menu.price.max}` : menu.price,
      description: menu.description || "",
      imageUrl: menu.imageUrl || menu.image_url || "",
      tags: menu.tags || [],
      is_active: menu.is_active !== undefined ? menu.is_active : true,
    });
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditId(null);
    setEditForm({ name: "", price: "", description: "", imageUrl: "", tags: [], is_active: true });
  };

  // CATEGORY LOGIC
  const handleCategoryEditSave = async (menuId, catKey, value) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc) return;
    const categories = { ...menuDoc.categories, [catKey]: { ...menuDoc.categories[catKey], display_name: value } };
    await updateDoc(doc(db, "Authentic Platters", menuId), { categories });
    setCategoryEdit({});
    fetchMenus();
  };
  const handleCategoryDelete = async (menuId, catKey) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc) return;
    const categories = { ...menuDoc.categories };
    delete categories[catKey];
    await updateDoc(doc(db, "Authentic Platters", menuId), { categories });
    fetchMenus();
  };
  const handleCategoryAdd = async (menuId, key, value) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc) return;
    const categories = { ...menuDoc.categories, [key]: { display_name: value } };
    await updateDoc(doc(db, "Authentic Platters", menuId), { categories });
    setNewCategory({});
    fetchMenus();
  };

  // CATEGORY ITEM LOGIC
  const handleItemEditSave = async (menuId, catKey, idx, value) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc) return;
    const cat = { ...menuDoc.categories[catKey] };
    cat.items = [...(cat.items || [])];
    cat.items[idx] = { ...cat.items[idx], name: value };
    const categories = { ...menuDoc.categories, [catKey]: cat };
    await updateDoc(doc(db, "Authentic Platters", menuId), { categories });
    setItemEdit({});
    fetchMenus();
  };
  const handleItemDelete = async (menuId, catKey, idx) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc) return;
    const cat = { ...menuDoc.categories[catKey] };
    cat.items = [...(cat.items || [])];
    cat.items.splice(idx, 1);
    const categories = { ...menuDoc.categories, [catKey]: cat };
    await updateDoc(doc(db, "Authentic Platters", menuId), { categories });
    fetchMenus();
  };
  const handleItemAdd = async (menuId, catKey, value) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc) return;
    const cat = { ...menuDoc.categories[catKey] };
    cat.items = [...(cat.items || []), { name: value }];
    const categories = { ...menuDoc.categories, [catKey]: cat };
    await updateDoc(doc(db, "Authentic Platters", menuId), { categories });
    setNewItem({});
    fetchMenus();
  };

  // EXTRA ITEMS LOGIC
  const handleExtraItemEditSave = async (menuId, idx, value) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc || !menuDoc.extra_items) return;
    const extra_items = { ...menuDoc.extra_items };
    extra_items.items = [...(extra_items.items || [])];
    extra_items.items[idx] = { ...extra_items.items[idx], name: value };
    await updateDoc(doc(db, "Authentic Platters", menuId), { extra_items });
    setExtraItemEdit({});
    fetchMenus();
  };
  const handleExtraItemDelete = async (menuId, idx) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc || !menuDoc.extra_items) return;
    const extra_items = { ...menuDoc.extra_items };
    extra_items.items = [...(extra_items.items || [])];
    extra_items.items.splice(idx, 1);
    await updateDoc(doc(db, "Authentic Platters", menuId), { extra_items });
    fetchMenus();
  };
  const handleExtraItemAdd = async (menuId, value) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc || !menuDoc.extra_items) return;
    const extra_items = { ...menuDoc.extra_items };
    extra_items.items = [...(extra_items.items || []), { name: value }];
    await updateDoc(doc(db, "Authentic Platters", menuId), { extra_items });
    setNewExtraItem({});
    fetchMenus();
  };

  // PICKLE LOGIC
  const handlePickleEditSave = async (menuId, idx, value) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc || !menuDoc.pickle) return;
    const pickle = { ...menuDoc.pickle };
    pickle.items = [...(pickle.items || [])];
    if (Array.isArray(pickle.items[idx].items)) {
      pickle.items[idx].items[0].name = value;
    } else {
      pickle.items[idx].name = value;
    }
    await updateDoc(doc(db, "Authentic Platters", menuId), { pickle });
    setPickleEdit({});
    fetchMenus();
  };
  const handlePickleDelete = async (menuId, idx) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc || !menuDoc.pickle) return;
    const pickle = { ...menuDoc.pickle };
    pickle.items = [...(pickle.items || [])];
    pickle.items.splice(idx, 1);
    await updateDoc(doc(db, "Authentic Platters", menuId), { pickle });
    fetchMenus();
  };
  const handlePickleAdd = async (menuId, value) => {
    const menuDoc = menus.find(m => m.id === menuId);
    if (!menuDoc || !menuDoc.pickle) return;
    const pickle = { ...menuDoc.pickle };
    pickle.items = [...(pickle.items || []), { name: value }];
    await updateDoc(doc(db, "Authentic Platters", menuId), { pickle });
    setNewPickle({});
    fetchMenus();
  };

  // Save edit
  const handleEditSave = async (e) => {
    e.preventDefault();
    let price = editForm.price;
    if (typeof price === "string" && price.includes("-")) {
      const [min, max] = price.split("-").map(Number);
      price = { min, max };
    } else if (!isNaN(Number(price))) {
      price = Number(price);
    }
    await updateDoc(doc(db, "Authentic Platters", editId), {
      ...editForm,
      price,
      is_active: editForm.is_active,
      tags: editForm.tags,
    });
    setEditId(null);
    setEditForm({ name: "", price: "", description: "", imageUrl: "", tags: [], is_active: true });
    fetchMenus();
  };

  // Delete menu item
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      await deleteDoc(doc(db, "Authentic Platters", id));
      fetchMenus();
    }
  };

  if (!isAdmin) return <div className="admin-access-denied">Access Denied</div>;

  return (
    <div className="adminMenuWrapper">
      <h2>Admin Menu Management</h2>
      {/* Add Menu Form */}
      <form onSubmit={handleAdd} className="menuForm">
        <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input type="text" placeholder="Price (e.g. 100 or 100-200)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
        <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="url" placeholder="Image URL" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
        <input type="text" placeholder="Add tag and press Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setForm({ ...form, tags: [...form.tags, tagInput.trim()] }); setTagInput(""); } } }} />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{form.tags && form.tags.map((tag, i) => <span key={tag} className="menuTag">{tag} <button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter((t, idx) => idx !== i) })} style={{ marginLeft: 2, color: "red", background: "none", border: "none", cursor: "pointer" }}>x</button></span>)}</div>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active
        </label>
        <button type="submit">Add Menu Item</button>
      </form>
      <div className="menuList">
        {menus.map(menu => (
          <div key={menu.id} className="menuItem" style={{ flexDirection: "column", alignItems: "stretch" }}>
            {/* Edit Mode */}
            {editId === menu.id ? (
              <form onSubmit={handleEditSave} className="editForm" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                <input type="text" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} required />
                <input type="text" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                <input type="url" value={editForm.imageUrl} onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{editForm.tags && editForm.tags.map((tag, i) => <span key={tag} className="menuTag">{tag} <button type="button" onClick={() => setEditForm({ ...editForm, tags: editForm.tags.filter((t, idx) => idx !== i) })} style={{ marginLeft: 2, color: "red", background: "none", border: "none", cursor: "pointer" }}>x</button></span>)}</div>
                <input type="text" placeholder="Add tag and press Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setEditForm({ ...editForm, tags: [...editForm.tags, tagInput.trim()] }); setTagInput(""); } } }} />
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })} /> Active
                </label>
                {editForm.imageUrl && <img src={editForm.imageUrl} alt="preview" className="menuImg" style={{ marginTop: 8 }} />}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button type="submit">Save</button>
                  <button type="button" onClick={handleEditCancel}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="menuItemInfo" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <strong style={{ fontSize: 20 }}>{menu.name}</strong>
                    <span style={{ fontWeight: 500, color: menu.is_active ? "#0a5247" : "#e53935" }}>{menu.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <div style={{ fontWeight: 500, color: "#333" }}>
                    {menu.price && typeof menu.price === "object" && menu.price.min !== undefined && menu.price.max !== undefined
                      ? <>₹{menu.price.min} - ₹{menu.price.max}</>
                      : menu.price !== undefined ? <>₹{menu.price}</> : null}
                  </div>
                  {menu.description && <div className="menuDesc">{menu.description}</div>}
                  {menu.tags && Array.isArray(menu.tags) && (
                    <div className="menuTags">
                      {menu.tags.map(tag => (
                        <span key={tag} className="menuTag">{tag}</span>
                      ))}
                    </div>
                  )}
                  {(menu.imageUrl || menu.image_url) && (
                    <img src={menu.imageUrl || menu.image_url} alt={menu.name} className="menuImg" />
                  )}
                  <div className="menuActions">
                    <button className="action-btn" onClick={() => handleEditStart(menu)}>Edit Info</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(menu.id)}>Delete</button>
                    <button className={`action-btn expand-btn ${expandedMenu === menu.id ? 'expanded' : ''}`} onClick={() => setExpandedMenu(expandedMenu === menu.id ? null : menu.id)}>
                      {expandedMenu === menu.id ? "Collapse" : "Expand"} Sections
                      <span className="expand-arrow">▼</span>
                    </button>
                  </div>
                </div>
                {/* Expanded Sections */}
                {expandedMenu === menu.id && (
                  <div style={{ marginTop: 16, background: "#f0f4f8", borderRadius: 8, padding: 12 }}>
                    {/* Categories Section */}
                    <div style={{ marginBottom: 12 }}>
                      <strong>Categories:</strong>
                      <ul style={{ marginLeft: 16 }}>
                        {menu.categories && Object.entries(menu.categories).map(([catKey, catVal]) => (
                          <li key={catKey} style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 500 }}>{catVal.display_name || catVal.displayName || catKey}</span>
                              {catVal.selection_type || catVal.selectionType ? <span style={{ color: "#888" }}>({catVal.selection_type || catVal.selectionType})</span> : null}
                              {categoryEdit.menuId === menu.id && categoryEdit.catKey === catKey ? (
                                <>
                                  <input type="text" value={categoryEdit.value} onChange={e => setCategoryEdit({ ...categoryEdit, value: e.target.value })} className="adminInput small" />
                                  <button type="button" className="adminBtn small primary" onClick={() => handleCategoryEditSave(menu.id, catKey, categoryEdit.value)}>Save</button>
                                  <button type="button" className="adminBtn small" onClick={() => setCategoryEdit({})}>Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button type="button" className="adminBtn small" onClick={() => setCategoryEdit({ menuId: menu.id, catKey, value: catVal.display_name || catVal.displayName || "" })}>Edit</button>
                                  <button type="button" className="adminBtn small danger" onClick={() => handleCategoryDelete(menu.id, catKey)}>Delete</button>
                                </>
                              )}
                            </div>
                            {/* Items in category */}
                            {Array.isArray(catVal.items) && (
                              <ul style={{ marginLeft: 16 }}>
                                {catVal.items.map((item, idx) => (
                                  <li key={item.name || idx}>
                                    {itemEdit.menuId === menu.id && itemEdit.catKey === catKey && itemEdit.idx === idx ? (
                                      <>
                                        <input type="text" value={itemEdit.value} onChange={e => setItemEdit({ ...itemEdit, value: e.target.value })} className="adminInput small" />
                                        <button type="button" className="adminBtn small primary" onClick={() => handleItemEditSave(menu.id, catKey, idx, itemEdit.value)}>Save</button>
                                        <button type="button" className="adminBtn small" onClick={() => setItemEdit({})}>Cancel</button>
                                      </>
                                    ) : (
                                      <>
                                        {item.name || item.n || item.na}
                                        {item.extra_price || item.extraPrice ? ` (+₹${item.extra_price || item.extraPrice})` : ""}
                                        <button type="button" className="adminBtn small" onClick={() => setItemEdit({ menuId: menu.id, catKey, idx, value: item.name || item.n || item.na || "" })}>Edit</button>
                                        <button type="button" className="adminBtn small danger" onClick={() => handleItemDelete(menu.id, catKey, idx)}>Delete</button>
                                      </>
                                    )}
                                  </li>
                                ))}
                                <li>
                                  {newItem.menuId === menu.id && newItem.catKey === catKey ? (
                                    <>
                                      <input type="text" value={newItem.value} onChange={e => setNewItem({ ...newItem, value: e.target.value })} className="adminInput small" />
                                      <button type="button" className="adminBtn small primary" onClick={() => handleItemAdd(menu.id, catKey, newItem.value)}>Add</button>
                                      <button type="button" className="adminBtn small" onClick={() => setNewItem({})}>Cancel</button>
                                    </>
                                  ) : (
                                    <button type="button" className="adminBtn small" onClick={() => setNewItem({ menuId: menu.id, catKey, value: "" })}>Add Item</button>
                                  )}
                                </li>
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                      {newCategory.menuId === menu.id ? (
                        <div style={{ marginTop: 4 }}>
                          <input type="text" placeholder="Key" value={newCategory.key} onChange={e => setNewCategory({ ...newCategory, key: e.target.value })} className="adminInput small" />
                          <input type="text" placeholder="Display Name" value={newCategory.value} onChange={e => setNewCategory({ ...newCategory, value: e.target.value })} className="adminInput small" />
                          <button type="button" className="adminBtn small primary" onClick={() => handleCategoryAdd(menu.id, newCategory.key, newCategory.value)}>Add</button>
                          <button type="button" className="adminBtn small" onClick={() => setNewCategory({})}>Cancel</button>
                        </div>
                      ) : (
                        <button type="button" className="adminBtn small" style={{ marginTop: 4 }} onClick={() => setNewCategory({ menuId: menu.id, key: "", value: "" })}>Add Category</button>
                      )}
                    </div>
                    {/* Extra Items Section */}
                    {menu.extra_items && (
                      <div style={{ marginBottom: 12 }}>
                        <strong>Extra Items:</strong> {menu.extra_items.display_name || menu.extra_items.displayName}
                        <ul style={{ marginLeft: 16 }}>
                          {Array.isArray(menu.extra_items.items) && menu.extra_items.items.map((item, idx) => (
                            <li key={item.name || idx}>
                              {extraItemEdit.menuId === menu.id && extraItemEdit.idx === idx ? (
                                <>
                                  <input type="text" value={extraItemEdit.value} onChange={e => setExtraItemEdit({ ...extraItemEdit, value: e.target.value })} className="adminInput small" />
                                  <button type="button" className="adminBtn small primary" onClick={() => handleExtraItemEditSave(menu.id, idx, extraItemEdit.value)}>Save</button>
                                  <button type="button" className="adminBtn small" onClick={() => setExtraItemEdit({})}>Cancel</button>
                                </>
                              ) : (
                                <>
                                  {item.name}
                                  {item.extra_price ? ` (+₹${item.extra_price})` : ""}
                                  <button type="button" className="adminBtn small" onClick={() => setExtraItemEdit({ menuId: menu.id, idx, value: item.name })}>Edit</button>
                                  <button type="button" className="adminBtn small danger" onClick={() => handleExtraItemDelete(menu.id, idx)}>Delete</button>
                                </>
                              )}
                            </li>
                          ))}
                          <li>
                            {newExtraItem.menuId === menu.id ? (
                              <>
                                <input type="text" value={newExtraItem.value} onChange={e => setNewExtraItem({ ...newExtraItem, value: e.target.value })} className="adminInput small" />
                                <button type="button" className="adminBtn small primary" onClick={() => handleExtraItemAdd(menu.id, newExtraItem.value)}>Add</button>
                                <button type="button" className="adminBtn small" onClick={() => setNewExtraItem({})}>Cancel</button>
                              </>
                            ) : (
                              <button type="button" className="adminBtn small" onClick={() => setNewExtraItem({ menuId: menu.id, value: "" })}>Add Extra Item</button>
                            )}
                          </li>
                        </ul>
                      </div>
                    )}
                    {/* Pickle Section */}
                    {menu.pickle && (
                      <div style={{ marginBottom: 12 }}>
                        <strong>Pickle:</strong> {menu.pickle.display_name || menu.pickle.displayName}
                        <ul style={{ marginLeft: 16 }}>
                          {Array.isArray(menu.pickle.items) && menu.pickle.items.map((item, idx) => (
                            <li key={idx}>
                              {pickleEdit.menuId === menu.id && pickleEdit.idx === idx ? (
                                <>
                                  <input type="text" value={pickleEdit.value} onChange={e => setPickleEdit({ ...pickleEdit, value: e.target.value })} className="adminInput small" />
                                  <button type="button" className="adminBtn small primary" onClick={() => handlePickleEditSave(menu.id, idx, pickleEdit.value)}>Save</button>
                                  <button type="button" className="adminBtn small" onClick={() => setPickleEdit({})}>Cancel</button>
                                </>
                              ) : (
                                <>
                                  {Array.isArray(item.items)
                                    ? item.items.map((sub, subIdx) => <span key={subIdx}>{sub.name} </span>)
                                    : item.name}
                                  <button type="button" className="adminBtn small" onClick={() => setPickleEdit({ menuId: menu.id, idx, value: Array.isArray(item.items) ? (item.items[0]?.name || "") : (item.name || "") })}>Edit</button>
                                  <button type="button" className="adminBtn small danger" onClick={() => handlePickleDelete(menu.id, idx)}>Delete</button>
                                </>
                              )}
                            </li>
                          ))}
                          <li>
                            {newPickle.menuId === menu.id ? (
                              <>
                                <input type="text" value={newPickle.value} onChange={e => setNewPickle({ ...newPickle, value: e.target.value })} className="adminInput small" />
                                <button type="button" className="adminBtn small primary" onClick={() => handlePickleAdd(menu.id, newPickle.value)}>Add</button>
                                <button type="button" className="adminBtn small" onClick={() => setNewPickle({})}>Cancel</button>
                              </>
                            ) : (
                              <button type="button" className="adminBtn small" onClick={() => setNewPickle({ menuId: menu.id, value: "" })}>Add Pickle Item</button>
                            )}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminMenu;