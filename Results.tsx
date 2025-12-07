import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DiagnosticData, Product, SkincareBox, AIRecommendation } from '../types';
import { analyzeSkin } from '../services/geminiService';
import { storage } from '../services/storage';
import { useAppContext } from '../App';
import { Loader2, Info, Moon, Sun, X, CheckCircle2 } from 'lucide-react';

const Results: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [box, setBox] = useState<SkincareBox | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  
  // Order Form State
  const [orderForm, setOrderForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    comment: ''
  });

  useEffect(() => {
    if (!state?.diagnosticData || !user) {
      navigate('/diagnostics');
      return;
    }

    const generateBox = async () => {
      try {
        const inventory = storage.getProducts();
        const data = state.diagnosticData as DiagnosticData;

        const recommendation = await analyzeSkin(data, inventory);

        // Map recommended IDs back to full product objects
        const selectedProducts = recommendation.productIds
          .map(id => inventory.find(p => p.id === id))
          .filter((p): p is Product => !!p);

        const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);

        const newBox: SkincareBox = {
          id: Date.now().toString(),
          userId: user.id,
          createdAt: new Date().toISOString(),
          data,
          recommendation,
          products: selectedProducts,
          totalPrice,
          status: 'created'
        };

        storage.saveBox(newBox);
        setBox(newBox);
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при генерации.');
      } finally {
        setLoading(false);
      }
    };

    generateBox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!box) return;

    // --- WHATSAPP INTEGRATION ---
    // 1. Format the product list for the message
    const productList = box.products
      .map((p, i) => `${i + 1}. ${p.name} (${p.brand}) — ${p.price}₽`)
      .join('\n');

    // 2. Construct the message text
    const message = 
`👋 Здравствуйте! Хочу заказать персональный бокс Skinglow AI.

👤 *Данные клиента:*
Имя: ${orderForm.name}
Телефон: ${orderForm.phone}
Адрес: ${orderForm.address}

📦 *СОСТАВ БОКСА:*
${productList}

💰 *Итого:* ${box.totalPrice} ₽
🔍 *Тип кожи:* ${box.data.skinType}
`.trim();

    // 3. Encode for URL
    const encodedMessage = encodeURIComponent(message);
    
    // 4. Your WhatsApp Number (REPLACE THIS WITH YOUR NUMBER)
    // Format: No plus sign, just country code and number. Example: 79991234567
    const MANAGER_PHONE = '79990000000'; 

    // 5. Open WhatsApp
    const whatsappUrl = `https://wa.me/${MANAGER_PHONE}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // 6. Close modal and redirect
    setShowOrderForm(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <Loader2 size={48} className="text-teal-500 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Анализируем вашу кожу...</h2>
        <p className="text-stone-500 max-w-md">
          Нейросеть изучает вашу анкету, подбирает активные ингредиенты и составляет идеальную формулу ухода.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-red-500 text-xl font-bold mb-4">Ошибка</div>
        <p className="text-stone-600 mb-6">{error}</p>
        <button onClick={() => navigate('/diagnostics')} className="bg-stone-900 text-white px-6 py-2 rounded-lg">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!box) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      
      {/* Intro */}
      <div className="text-center mb-12">
        <div className="inline-block bg-teal-100 text-teal-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
          Анализ завершен
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900">Ваш персональный бьюти-бокс</h1>
      </div>

      {/* 1. Box Composition (First) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-stone-900 mb-6 px-2 flex items-center gap-2">
          <CheckCircle2 className="text-teal-500" />
          Состав бокса
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {box.products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 flex gap-5 hover:border-teal-200 hover:shadow-md transition-all">
              <div className="w-24 h-24 shrink-0 bg-stone-50 rounded-lg overflow-hidden border border-stone-100 relative group">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wide bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">{product.type}</span>
                  <span className="font-bold text-stone-900 text-lg">{product.price} ₽</span>
                </div>
                <h4 className="font-bold text-stone-800 mb-1 text-lg leading-tight">{product.name}</h4>
                <p className="text-sm text-stone-400 mb-3">{product.brand}</p>
                <div className="bg-gradient-to-r from-rose-50 to-white p-3 rounded-lg text-sm text-stone-600 border border-rose-100">
                  <span className="font-semibold text-rose-700">Почему это:</span> {box.recommendation.reasoning[product.id]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Price & CTA */}
        <div className="mt-8 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="text-stone-400 text-sm uppercase tracking-wider mb-1">Итоговая стоимость</div>
            <div className="text-4xl font-bold">{box.totalPrice} ₽</div>
            <p className="text-stone-400 text-sm mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span> 
              5 средств подобраны специально для вас
            </p>
          </div>
          <button 
            onClick={() => setShowOrderForm(true)}
            className="bg-white text-stone-900 hover:bg-teal-50 px-10 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 w-full md:w-auto text-center"
          >
            Оформить заказ
          </button>
        </div>
      </section>

      {/* 2. Strategy & Analysis (Second) */}
      <section>
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-rose-50 px-8 py-6 border-b border-stone-100">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">AI Стратегия ухода</h2>
            <p className="text-stone-600">Подробный разбор потребностей вашей кожи</p>
          </div>
          
          <div className="p-8 grid md:grid-cols-2 gap-8">
            {/* Left Column: Analysis */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Info size={18} className="text-teal-500" />
                  Состояние кожи
                </h3>
                <p className="text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-100">
                  {box.recommendation.analysis}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">Причины проблем</h3>
                <p className="text-stone-600 leading-relaxed pl-4 border-l-2 border-rose-200">
                  {box.recommendation.causes}
                </p>
              </div>
            </div>

            {/* Right Column: Routine */}
            <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
              <h3 className="text-lg font-bold text-teal-800 mb-4">Ваша рутина</h3>
              <p className="text-stone-700 font-medium italic mb-6">"{box.recommendation.strategy}"</p>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-stone-100">
                  <div className="mt-1 bg-amber-100 text-amber-500 p-2 rounded-full h-fit"><Sun size={20} /></div>
                  <div>
                    <div className="font-bold text-sm uppercase text-stone-500 mb-1">Утро</div>
                    <p className="text-sm text-stone-700 leading-relaxed">{box.recommendation.routine.morning}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-stone-100">
                  <div className="mt-1 bg-indigo-100 text-indigo-500 p-2 rounded-full h-fit"><Moon size={20} /></div>
                  <div>
                    <div className="font-bold text-sm uppercase text-stone-500 mb-1">Вечер</div>
                    <p className="text-sm text-stone-700 leading-relaxed">{box.recommendation.routine.evening}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-slideIn border border-stone-100">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-stone-800">Оформление заказа</h3>
              <button 
                onClick={() => setShowOrderForm(false)}
                className="p-1 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleOrderSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Ваше имя</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-3 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-stone-400 outline-none transition-colors"
                  value={orderForm.name}
                  onChange={e => setOrderForm({...orderForm, name: e.target.value})}
                  placeholder="Иван Иванов"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Телефон</label>
                <input 
                  type="tel" 
                  required
                  className="w-full p-3 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-stone-400 outline-none transition-colors"
                  value={orderForm.phone}
                  onChange={e => setOrderForm({...orderForm, phone: e.target.value})}
                  placeholder="+7 (961) 687 25-98"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Адрес доставки</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full p-3 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-stone-400 outline-none transition-colors resize-none"
                  value={orderForm.address}
                  onChange={e => setOrderForm({...orderForm, address: e.target.value})}
                  placeholder="Город, улица, дом, квартира"
                />
              </div>

              <div className="bg-teal-50 p-4 rounded-lg flex justify-between items-center border border-teal-100">
                <span className="text-stone-600">К оплате:</span>
                <span className="font-bold text-xl text-teal-800">{box.totalPrice} ₽</span>
              </div>

              <div className="text-xs text-stone-500 text-center">
                Нажимая кнопку, вы перейдете в WhatsApp для подтверждения заказа с менеджером.
              </div>

              <button 
                type="submit"
                className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-teal-600 transition-colors mt-2 shadow-lg flex items-center justify-center gap-2"
              >
                Оформить через WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Results;