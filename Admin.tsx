import React, { useState, useEffect } from 'react';
import { Product, ProductType, SkincareBox } from '../types';
import { storage } from '../services/storage';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'requests'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [boxes, setBoxes] = useState<SkincareBox[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(storage.getProducts());
    setBoxes(storage.getBoxes().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      ...editProduct,
      id: editProduct.id || Date.now().toString(),
      price: Number(editProduct.price),
      imageUrl: editProduct.imageUrl || `https://picsum.photos/200/200?random=${Date.now()}`
    } as Product;

    if (editProduct.id) {
      storage.updateProduct(newProduct);
    } else {
      storage.addProduct(newProduct);
    }
    
    setIsEditing(false);
    setEditProduct({});
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      storage.deleteProduct(id);
      refreshData();
    }
  };

  const openEdit = (product?: Product) => {
    setEditProduct(product || { 
      name: '', brand: '', price: 0, description: '', type: ProductType.OTHER 
    });
    setIsEditing(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Админ-панель</h1>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-stone-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            Товары ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            Заявки ({boxes.length})
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <>
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => openEdit()}
              className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Plus size={18} /> Добавить товар
            </button>
          </div>

          {isEditing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
                <h2 className="text-xl font-bold mb-4">{editProduct.id ? 'Редактировать' : 'Новый товар'}</h2>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="Название" 
                      value={editProduct.name || ''} 
                      onChange={e => setEditProduct({...editProduct, name: e.target.value})}
                      className="border p-2 rounded" required
                    />
                    <input 
                      placeholder="Бренд" 
                      value={editProduct.brand || ''} 
                      onChange={e => setEditProduct({...editProduct, brand: e.target.value})}
                      className="border p-2 rounded" required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      value={editProduct.type} 
                      onChange={e => setEditProduct({...editProduct, type: e.target.value as ProductType})}
                      className="border p-2 rounded"
                    >
                      {Object.values(ProductType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input 
                      type="number" 
                      placeholder="Цена" 
                      value={editProduct.price || ''} 
                      onChange={e => setEditProduct({...editProduct, price: Number(e.target.value)})}
                      className="border p-2 rounded" required
                    />
                  </div>
                  <textarea 
                    placeholder="Описание" 
                    value={editProduct.description || ''} 
                    onChange={e => setEditProduct({...editProduct, description: e.target.value})}
                    className="border p-2 rounded w-full" rows={3} required
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-stone-600">Отмена</button>
                    <button type="submit" className="px-4 py-2 bg-stone-900 text-white rounded">Сохранить</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow border border-stone-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Товар</th>
                  <th className="p-4">Категория</th>
                  <th className="p-4">Цена</th>
                  <th className="p-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.imageUrl} alt="" className="w-10 h-10 rounded object-cover bg-stone-100" />
                      <div>
                        <div className="font-medium text-stone-900">{p.name}</div>
                        <div className="text-xs text-stone-500">{p.brand}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-stone-600">{p.type}</td>
                    <td className="p-4 text-sm font-medium">{p.price} ₽</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEdit(p)} className="text-stone-400 hover:text-blue-500 mx-2"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow border border-stone-200 overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Пользователь</th>
                  <th className="p-4">Дата</th>
                  <th className="p-4">Тип кожи</th>
                  <th className="p-4">Сумма</th>
                  <th className="p-4">Стратегия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {boxes.map(b => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="p-4 text-sm">{b.userId}</td>
                    <td className="p-4 text-sm text-stone-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-sm">
                      <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-xs font-bold">{b.data.skinType}</span>
                    </td>
                    <td className="p-4 text-sm font-bold">{b.totalPrice} ₽</td>
                    <td className="p-4 text-sm text-stone-600 max-w-xs truncate" title={b.recommendation.strategy}>
                      {b.recommendation.strategy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
