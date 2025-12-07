import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ScanFace, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-rose-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles size={14} />
              AI Technology
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight mb-6 leading-tight">
              Персональный подбор ухода с <span className="text-rose-500">Искусственным Интеллектом</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 mb-10 leading-relaxed">
              Опишите состояние кожи или загрузите фото — наша нейросеть проанализирует ваши потребности и соберет индивидуальный бокс ухода из лучших средств.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/diagnostics" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 text-white rounded-full font-bold text-lg hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-200 transform hover:-translate-y-1"
              >
                Пройти диагностику
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-teal-100 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 text-stone-800">
                <ScanFace size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Умная диагностика</h3>
              <p className="text-stone-600">
                Загрузите фото или заполните анкету. AI определит тип кожи и проблемные зоны лучше косметолога.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 text-stone-800">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Индивидуальный алгоритм</h3>
              <p className="text-stone-600">
                Мы не предлагаем всем одно и то же. Ваш бокс формируется уникально под ваши задачи и бюджет.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 text-stone-800">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Готовое решение</h3>
              <p className="text-stone-600">
                Получите полную рутину: от умывания до SPF, с инструкцией когда и как наносить.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
