import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiagnosticData, SkinType } from '../types';
import { 
  Camera, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Sun, 
  CloudSnow, 
  CloudRain, 
  Wind,
  Wallet,
  AlertCircle
} from 'lucide-react';

const CONCERNS_LIST = [
  'Акне и высыпания',
  'Покраснения (розацеа)',
  'Сухость и шелушение',
  'Жирный блеск',
  'Постакне и пятна',
  'Морщины и линии',
  'Расширенные поры',
  'Тусклый цвет лица'
];

const BUDGET_OPTIONS = [
  { label: 'До 3 000 ₽', value: 'До 3 000 ₽', desc: 'Базовый уход' },
  { label: 'До 6 000 ₽', value: 'До 6 000 ₽', desc: 'Оптимальный набор' },
  { label: 'До 10 000 ₽', value: 'До 10 000 ₽', desc: 'Премиум уход' },
  { label: 'Без ограничений', value: 'Без ограничений', desc: 'Максимальный эффект' }
];

const SEASONS = [
  { label: 'Зима', icon: <CloudSnow size={20} /> },
  { label: 'Весна', icon: <CloudRain size={20} /> },
  { label: 'Лето', icon: <Sun size={20} /> },
  { label: 'Осень', icon: <Wind size={20} /> },
];

const TOTAL_STEPS = 6;

const Diagnostics: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'next' | 'back'>('next');
  
  // Logic to determine current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth(); // 0-11
    if (month === 11 || month === 0 || month === 1) return 'Зима';
    if (month >= 2 && month <= 4) return 'Весна';
    if (month >= 5 && month <= 7) return 'Лето';
    return 'Осень';
  };

  const [formData, setFormData] = useState<DiagnosticData>({
    skinType: null as unknown as SkinType, // No default selection
    concerns: [],
    season: getCurrentSeason(),
    allergies: '',
    budget: BUDGET_OPTIONS[1].value,
    description: '',
    photoBase64: undefined
  });

  // Validation
  const canProceed = () => {
    if (step === 1 && !formData.skinType) return false;
    return true;
  };

  // Handlers
  const nextStep = () => {
    if (canProceed() && step < TOTAL_STEPS) {
      setDirection('next');
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else if (step === TOTAL_STEPS) {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection('back');
      setStep(prev => prev - 1);
    }
  };

  const toggleConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    navigate('/results', { state: { diagnosticData: formData } });
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-slideIn">
            <h2 className="text-2xl font-bold text-stone-900 text-center mb-2">Какой у вас тип кожи?</h2>
            <p className="text-stone-500 text-center mb-8">Выберите вариант, который лучше всего описывает ваше обычное состояние.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(SkinType).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, skinType: type })}
                  className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                    formData.skinType === type
                      ? 'border-rose-500 bg-rose-50/50'
                      : 'border-stone-200 bg-white hover:border-rose-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold text-lg ${formData.skinType === type ? 'text-rose-700' : 'text-stone-800'}`}>
                      {type}
                    </span>
                    {formData.skinType === type && <div className="bg-rose-500 rounded-full p-1"><Check size={12} className="text-white"/></div>}
                  </div>
                  <p className="text-sm text-stone-500">
                    {type === SkinType.DRY && 'Ощущение стянутости, шелушения, матовость.'}
                    {type === SkinType.OILY && 'Жирный блеск по всему лицу, расширенные поры.'}
                    {type === SkinType.COMBINATION && 'Жирная Т-зона (лоб, нос), нормальные или сухие щеки.'}
                    {type === SkinType.NORMAL && 'Сбалансированная кожа, без явных проблем.'}
                  </p>
                </button>
              ))}
            </div>
            {!formData.skinType && (
               <p className="text-center text-rose-500 text-sm mt-4 animate-pulse">Пожалуйста, выберите тип кожи чтобы продолжить</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-slideIn">
            <h2 className="text-2xl font-bold text-stone-900 text-center mb-2">Что вас беспокоит?</h2>
            <p className="text-stone-500 text-center mb-8">Можно выбрать несколько вариантов.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONCERNS_LIST.map((concern) => (
                <button
                  key={concern}
                  onClick={() => toggleConcern(concern)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                    formData.concerns.includes(concern)
                      ? 'border-rose-500 bg-rose-50/50 text-stone-900 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <span className="font-medium">{concern}</span>
                  {formData.concerns.includes(concern) && <Check size={18} className="text-rose-500" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-slideIn">
            <h2 className="text-2xl font-bold text-stone-900 text-center mb-2">Контекст и особенности</h2>
            <p className="text-stone-500 text-center mb-8">Учтем сезонность и возможные реакции.</p>

            {/* Season */}
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-4 uppercase tracking-wider">Текущий сезон</label>
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {SEASONS.map((season) => (
                  <button
                    key={season.label}
                    onClick={() => setFormData({ ...formData, season: season.label })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      formData.season === season.label
                        ? 'border-rose-500 bg-rose-50/50 text-rose-700'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    <div className="mb-2">{season.icon}</div>
                    <span className="text-sm font-medium">{season.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">
                Аллергии или непереносимость
              </label>
              <div className="relative">
                <AlertCircle className="absolute top-3.5 left-3.5 text-stone-400" size={20} />
                <input
                  type="text"
                  placeholder="Например: витамин С, мед, орехи (или оставьте пустым)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-stone-900 focus:border-rose-500 focus:ring-0 outline-none transition-colors"
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-slideIn">
             <h2 className="text-2xl font-bold text-stone-900 text-center mb-2">Ваш бюджет</h2>
             <p className="text-stone-500 text-center mb-8">Сколько вы готовы инвестировать в свой уход?</p>

             <div className="space-y-3">
                {BUDGET_OPTIONS.map((opt) => (
                   <button
                   key={opt.value}
                   onClick={() => setFormData({ ...formData, budget: opt.value })}
                   className={`w-full flex items-center p-4 rounded-xl border-2 text-left transition-all ${
                     formData.budget === opt.value
                       ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500'
                       : 'border-stone-200 bg-white hover:border-stone-300'
                   }`}
                 >
                   <div className={`p-3 rounded-full mr-4 ${formData.budget === opt.value ? 'bg-rose-200 text-rose-700' : 'bg-stone-100 text-stone-500'}`}>
                      <Wallet size={24} />
                   </div>
                   <div>
                     <div className="font-bold text-stone-900">{opt.label}</div>
                     <div className="text-sm text-stone-500">{opt.desc}</div>
                   </div>
                   <div className="ml-auto">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.budget === opt.value ? 'border-rose-500' : 'border-stone-300'}`}>
                      {formData.budget === opt.value && <div className="w-3 h-3 rounded-full bg-rose-500" />}
                    </div>
                   </div>
                 </button>
                ))}
             </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-slideIn">
             <h2 className="text-2xl font-bold text-stone-900 text-center mb-2">Опишите свои ощущения</h2>
             <p className="text-stone-500 text-center mb-8">Расскажите нейросети детали, которые не вошли в анкету.</p>

             <div className="relative">
                <textarea
                  rows={6}
                  placeholder="Например: 'Кожа сильно стянута после умывания водой', 'Жирнится лоб к обеду', 'Хочу сияния'..."
                  className="w-full p-5 rounded-2xl border-2 border-stone-200 bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 outline-none resize-none text-lg text-stone-900 placeholder-stone-400 transition-all shadow-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  autoFocus
                />
             </div>
             <p className="text-xs text-stone-500 text-center font-medium">Чем подробнее описание, тем точнее рекомендации AI.</p>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-slideIn">
             <h2 className="text-2xl font-bold text-stone-900 text-center mb-2">Фотоанализ</h2>
             <p className="text-stone-500 text-center mb-8">Необязательно. AI может проанализировать текстуру кожи по фото.</p>

             <div className="max-w-md mx-auto">
              <label 
                className={`relative flex flex-col items-center justify-center w-full h-80 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                  formData.photoBase64 
                    ? 'border-rose-300 bg-rose-50/50' 
                    : 'border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                {formData.photoBase64 ? (
                  <>
                    <img 
                      src={formData.photoBase64} 
                      alt="Preview" 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Camera size={48} className="text-white mb-2" />
                      <span className="text-white font-medium">Нажмите, чтобы изменить</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-6 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-rose-500">
                      <Camera size={32} />
                    </div>
                    <span className="text-lg font-bold text-stone-700 mb-2">Загрузить фото</span>
                    <span className="text-sm text-stone-400">JPG или PNG. Желательно при дневном свете без макияжа.</span>
                  </div>
                )}
              </label>
              
              {formData.photoBase64 && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData(prev => ({ ...prev, photoBase64: undefined }));
                  }}
                  className="w-full mt-4 text-sm text-red-500 hover:text-red-600 font-medium text-center"
                >
                  Удалить фото
                </button>
              )}
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Шаг {step} из {TOTAL_STEPS}</span>
            <span className="text-xs font-bold text-rose-500">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-stone-200 p-6 sm:p-10 min-h-[500px] flex flex-col relative overflow-hidden">
          
          {/* Content */}
          <div className="flex-grow flex flex-col justify-center relative z-10">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between relative z-10 pt-6 border-t border-stone-100">
            <button
              onClick={prevStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                step === 1 
                  ? 'opacity-0 pointer-events-none' 
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <ChevronLeft size={20} />
              Назад
            </button>

            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`group flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform active:translate-y-0 ${
                canProceed() 
                  ? 'bg-stone-900 text-white hover:bg-rose-500 hover:-translate-y-0.5' 
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              {step === TOTAL_STEPS ? (
                <>
                  Получить результат
                  <Sparkles size={18} className={canProceed() ? "animate-pulse" : ""} />
                </>
              ) : (
                <>
                  Далее
                  <ChevronRight size={20} className={canProceed() ? "group-hover:translate-x-1 transition-transform" : ""} />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Diagnostics;