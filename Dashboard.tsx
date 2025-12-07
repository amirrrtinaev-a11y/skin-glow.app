import React, { useEffect, useState } from 'react';
import { useAppContext } from '../App';
import { SkincareBox } from '../types';
import { storage } from '../services/storage';
import { Calendar, ChevronRight, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAppContext();
  const [boxes, setBoxes] = useState<SkincareBox[]>([]);

  useEffect(() => {
    if (user) {
      setBoxes(storage.getUserBoxes(user.id));
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Мои персональные боксы</h1>

      {boxes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
          <PackageOpen size={48} className="mx-auto text-stone-300 mb-4" />
          <h3 className="text-xl font-medium text-stone-600 mb-4">У вас пока нет сохраненных боксов</h3>
          <Link 
            to="/diagnostics" 
            className="inline-block bg-rose-500 text-white px-6 py-2 rounded-full font-medium hover:bg-rose-600 transition-colors"
          >
            Пройти диагностику
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {boxes.map((box) => (
            <div key={box.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {box.data.skinType}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-stone-500">
                    <Calendar size={14} />
                    {new Date(box.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-stone-800 mb-2">{box.recommendation.strategy}</h3>
                <p className="text-stone-600 text-sm line-clamp-2 mb-4">{box.recommendation.analysis}</p>

                <div className="flex flex-wrap gap-2">
                  {box.products.slice(0, 4).map(p => (
                    <img 
                      key={p.id} 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-12 h-12 rounded-lg object-cover border border-stone-100" 
                      title={p.name}
                    />
                  ))}
                  {box.products.length > 4 && (
                    <div className="w-12 h-12 rounded-lg border border-stone-100 bg-stone-50 flex items-center justify-center text-xs text-stone-500 font-medium">
                      +{box.products.length - 4}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between items-end min-w-[150px] border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
                <div className="text-2xl font-bold text-stone-900">{box.totalPrice} ₽</div>
                <button 
                    onClick={() => alert("Повторный заказ оформлен!")}
                    className="mt-4 w-full py-2 border-2 border-stone-900 text-stone-900 rounded-lg font-bold hover:bg-stone-900 hover:text-white transition-colors text-sm"
                >
                    Заказать снова
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
