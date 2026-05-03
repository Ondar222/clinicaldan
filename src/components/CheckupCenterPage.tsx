import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppointmentModal from './AppointmentModal';
import archimedService from '../services/archimed';
import type { ArchimedDoctor } from '../types/cms';
import prodoctorovData from '../data/prodoctorov.json';

interface CheckupType {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  icon: string;
}

interface Specialist {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  image: string;
  isAvailable: boolean;
}

// Создаем мапу фото из prodoctorov.json
const doctorPhotoMap = new Map<string, string>();
if (Array.isArray(prodoctorovData)) {
  prodoctorovData.forEach((doc: any) => {
    if (doc.fullName && doc.photo) {
      doctorPhotoMap.set(doc.fullName.toLowerCase(), doc.photo);
    }
  });
}

const checkupTypes: CheckupType[] = [
  {
    id: 'gossluzhba-001',
    title: 'Госслужба 001',
    description: 'Для государственной службы. Женщины без анализов до 40 лет',
    price: 5150,
    duration: '1-2 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр неврологом',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '🏛️',
  },
  {
    id: 'gossluzhba-001-m',
    title: 'Госслужба 001 (мужчины)',
    description: 'Для государственной службы. Мужчины без анализов до 40 лет',
    price: 4950,
    duration: '1-2 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр неврологом',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '🏛️',
  },
  {
    id: 'gossluzhba-001-analizy-zh',
    title: 'Госслужба 001 с анализами (женщины)',
    description: 'Для государственной службы. Женщины с анализами до 40 лет',
    price: 9040,
    duration: '1-2 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр неврологом',
      'Общий анализ крови',
      'Общий анализ мочи',
      'Биохимия крови',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '🏛️',
  },
  {
    id: 'gossluzhba-001-analizy-m',
    title: 'Госслужба 001 с анализами (мужчины)',
    description: 'Для государственной службы. Мужчины с анализами до 40 лет',
    price: 8280,
    duration: '1-2 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр неврологом',
      'Общий анализ крови',
      'Общий анализ мочи',
      'Биохимия крови',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '🏛️',
  },
  {
    id: 'gossluzhba-001-vozrast-zh',
    title: 'Госслужба 001 (женщины от 40)',
    description: 'Для государственной службы. Женщины с анализами от 40 лет',
    price: 14385,
    duration: '2-3 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр неврологом',
      'Осмотр гинекологом',
      'Общий анализ крови',
      'Общий анализ мочи',
      'Биохимия крови',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '🏛️',
  },
  {
    id: 'gossluzhba-001-vozrast-m',
    title: 'Госслужба 001 (мужчины от 40)',
    description: 'Для государственной службы. Мужчины с анализами от 40 лет',
    price: 11705,
    duration: '2-3 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр неврологом',
      'Осмотр хирургом',
      'Общий анализ крови',
      'Общий анализ мочи',
      'Биохимия крови',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '🏛️',
  },
  {
    id: 'gossluzhba-001-bez-analizov-vozrast-zh',
    title: 'Госслужба 001 без анализов (женщины от 40)',
    description: 'Для государственной службы. Женщины без анализов от 40 лет',
    price: 6850,
    duration: '1-2 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр неврологом',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '🏛️',
  },
  {
    id: 'gossluzhba-001-bez-analizov-vozrast-m',
    title: 'Госслужба 001 без анализов (мужчины от 40)',
    description: 'Для государственной службы. Мужчины без анализов от 40 лет',
    price: 4950,
    duration: '1-2 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр неврологом',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '🏛️',
  },
  {
    id: 'sanatorium-card-zh',
    title: 'Санаторно-курортная карта (женщины)',
    description: 'Форма №072/у. Комплексное обследование для лечения в санатории',
    price: 7650,
    duration: '2-3 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр гинекологом',
      'Общий анализ крови',
      'Общий анализ мочи',
      'Биохимия крови',
      'Флюорография',
      'ЭКГ',
      'УЗИ органов брюшной полости',
    ],
    icon: '📋',
  },
  {
    id: 'sanatorium-card-m',
    title: 'Санаторно-курортная карта (мужчины)',
    description: 'Форма №072/у. Комплексное обследование для лечения в санатории',
    price: 4100,
    duration: '2-3 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр хирургом',
      'Общий анализ крови',
      'Общий анализ мочи',
      'Биохимия крови',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '📋',
  },
  {
    id: 'sanatorium-card-deti',
    title: 'Санаторно-курортная карта (дети)',
    description: 'Форма №072/у. Для детей при направлении в санаторий',
    price: 4720,
    duration: '2-3 дня',
    features: [
      'Осмотр педиатром',
      'Осмотр хирургом',
      'Общий анализ крови',
      'Общий анализ мочи',
      'Флюорография',
      'ЭКГ',
    ],
    icon: '📋',
  },
  {
    id: '086-zh',
    title: 'Справка 086/у (женщины)',
    description: 'Для поступления в ВУЗы, ССУЗы. Женский вариант',
    price: 4850,
    duration: '1-2 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр хирургом',
      'Осмотр неврологом',
      'Осмотр гинекологом',
      'Осмотр офтальмологом',
      'Осмотр ЛОРом',
      'Флюорография',
      'Общий анализ крови',
      'Общий анализ мочи',
    ],
    icon: '🎓',
  },
  {
    id: '086-m',
    title: 'Справка 086/у (мужчины)',
    description: 'Для поступления в ВУЗы, ССУЗы. Мужской вариант',
    price: 4450,
    duration: '1-2 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр хирургом',
      'Осмотр неврологом',
      'Осмотр офтальмологом',
      'Осмотр ЛОРом',
      'Флюорография',
      'Общий анализ крови',
      'Общий анализ мочи',
    ],
    icon: '🎓',
  },
  {
    id: 'voditel-b',
    title: 'Водительская справка (категория B)',
    description: 'Для категорий B, BE, B1. Для получения/замены водительского удостоверения',
    price: 2500,
    duration: '1-2 часа',
    features: [
      'Осмотр терапевтом',
      'Осмотр офтальмологом',
      'Осмотр неврологом',
      'Осмотр психиатром',
      'Осмотр наркологом',
    ],
    icon: '🚗',
  },
  {
    id: 'voditel-cd',
    title: 'Водительская справка (категории C, D)',
    description: 'Для категорий C, D, CE, DE, Tm, Tb и подкатегорий',
    price: 4800,
    duration: '1-2 дня',
    features: [
      'Осмотр терапевтом',
      'Осмотр офтальмологом',
      'Осмотр неврологом',
      'Осмотр психиатром',
      'Осмотр наркологом',
      'ЭЭГ (электроэнцефалограмма)',
    ],
    icon: '🚛',
  },
];

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

// Получение полного имени врача
const getDoctorFullName = (doctor: ArchimedDoctor): string => {
  return `${doctor.name} ${doctor.name1} ${doctor.name2}`.trim();
};

// URL фото врача: приоритеты:
// 1. Если photo начинается с http - это полный URL
// 2. Если photo начинается с / - это относительный путь
// 3. Если photo - base64 данные
// 4. Ищем в prodoctorov.json
// 5. Заглушка с инициалами
const getDoctorPhotoUrl = (doctor: ArchimedDoctor): string => {
  // Если photo начинается с http - это полный URL
  if (doctor.photo && doctor.photo.startsWith('http')) {
    return doctor.photo;
  }
  // Если photo начинается с / - это относительный путь
  if (doctor.photo && doctor.photo.startsWith('/')) {
    return doctor.photo;
  }
  // Если photo - это base64 данные (BMP и т.д.)
  if (doctor.photo && doctor.photo.length > 50) {
    // Проверяем, не начинается ли уже с data:
    if (doctor.photo.startsWith('data:')) {
      return doctor.photo;
    }
    // Это base64 данные - добавляем префикс для BMP
    return `data:image/bmp;base64,${doctor.photo}`;
  }
  
  // Ищем фото в prodoctorov.json по имени врача
  const fullName = getDoctorFullName(doctor).toLowerCase();
  const photoFromMap = doctorPhotoMap.get(fullName);
  if (photoFromMap) {
    // Если photo начинается с /, это путь к файлу в public/img_doctors/
    if (photoFromMap.startsWith('/')) {
      return photoFromMap;
    }
    return photoFromMap;
  }
  
  // Заглушка с инициалами
  const initials = `${doctor.name1?.charAt(0) || ''}${doctor.name2?.charAt(0) || ''}`.toUpperCase();
  return `https://placehold.co/300x400/e0f2f1/00695c?text=${initials || 'Врач'}`;
};

export default function CheckupCenterPage() {
  const [selectedCheckup, setSelectedCheckup] = useState<CheckupType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCheckupTitle, setSelectedCheckupTitle] = useState<string>('');
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка врачей из Archimed API для медосмотров
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctors = await archimedService.getDoctors();
        
        // Специальности врачей для медосмотров
        const checkupSpecialties = [
          /терапевт/i,
          /профпатолог/i,
          /невролог/i,
          /офтальмолог/i,
          /лор/i,
          /оториноларинголог/i,
          /хирург/i,
          /психиатр/i,
          /нарколог/i,
          /дерматолог/i,
          /фтизиатр/i,
        ];
        
        // Фильтруем врачей - только те, кто проводит медосмотры
        const filtered = doctors.filter(d => {
          // Пропускаем пустые имена
          if (!d.name || d.name.trim() === '') return false;
          
          // Пропускаем администраторов и тестовые записи
          const nameBlob = `${d.name || ""} ${d.name1 || ""} ${d.name2 || ""} ${d.type || ""}`.toLowerCase();
          if (/администратор|archimed|арбаев/i.test(nameBlob)) return false;
          
          // Пропускаем массажистов
          if (/массажист/i.test(d?.type || "")) return false;
          
          // Проверяем специальность
          const specialty = d.type || d.category || '';
          const matchesSpecialty = checkupSpecialties.some(regex => regex.test(specialty));
          
          return matchesSpecialty;
        });
        
        // Берём первых 8 доступных врачей
        const mapped = filtered.slice(0, 8).map((doctor) => ({
          id: doctor.id,
          name: `${doctor.name} ${doctor.name1} ${doctor.name2}`.trim(),
          specialty: doctor.category || doctor.type || 'Врач',
          experience: doctor.max_time ? Number.parseInt(doctor.max_time, 10) || 0 : 0,
          image: getDoctorPhotoUrl(doctor),
          isAvailable: true,
        }));
        setSpecialists(mapped);
      } catch (error) {
        console.error('Error loading doctors:', error);
        // Fallback к заглушкам если API недоступен
        setSpecialists([
          {
            id: 1,
            name: 'Иванова Мария Петровна',
            specialty: 'Врач-терапевт, руководитель Центра',
            experience: 18,
            image: 'https://placehold.co/300x400/e0f2f1/00695c?text=Иванова+М.П.',
            isAvailable: true,
          },
          {
            id: 2,
            name: 'Смирнов Алексей Владимирович',
            specialty: 'Врач профпатолог',
            experience: 15,
            image: 'https://placehold.co/300x400/e0f2f1/00695c?text=Смирнов+А.В.',
            isAvailable: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const handleBookAppointment = (checkupTitle: string) => {
    setSelectedCheckupTitle(checkupTitle);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCheckupTitle('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative text-white py-16 md:py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url(/bg-hero.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">Центр медосмотров</h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-90">
              Комплексные медицинские осмотры для граждан и организаций
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <a
                href="#checkups"
                className="bg-white text-primary px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                Виды медосмотров
              </a>
              <a
                href="#specialists"
                className="bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm md:text-base"
              >
                Наши специалисты
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Checkup Types */}
      <section id="checkups" className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4 text-dark">Виды медосмотров</h2>
          <p className="text-gray-600 text-center mb-8 md:mb-10 max-w-3xl mx-auto text-sm md:text-base">
            Мы проводим все основные виды медицинских осмотров. Выберите подходящий вариант
            и запишитесь на приём.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
            {checkupTypes.map((checkup) => (
              <div
                key={checkup.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-gradient-to-r from-primary to-primaryDark text-white p-3 md:p-4">
                  <div className="text-2xl md:text-3xl mb-1 md:mb-2">{checkup.icon}</div>
                  <h3 className="text-xs md:text-sm font-bold mb-1 md:mb-2 leading-tight">{checkup.title}</h3>
                  <p className="text-white/90 text-[10px] md:text-xs line-clamp-2">{checkup.description}</p>
                </div>

                <div className="p-3 md:p-4">
                  <div className="flex justify-between items-center mb-2 md:mb-3">
                    <div>
                      <span className="text-gray-500 text-[10px] md:text-xs">Стоимость:</span>
                      <div className="text-sm md:text-lg font-bold text-primary">
                        {formatPrice(checkup.price)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] md:text-xs">Срок:</span>
                      <div className="text-xs md:text-sm font-semibold text-dark">
                        {checkup.duration}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 md:mb-4">
                    <h4 className="font-semibold mb-1.5 md:mb-2 text-dark text-[10px] md:text-xs">В программе:</h4>
                    <ul className="space-y-1">
                      {checkup.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-start gap-1.5 text-gray-600 text-[10px] md:text-xs">
                          <svg
                            className="w-3 h-3 md:w-4 md:h-4 text-green-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="line-clamp-2">{feature}</span>
                        </li>
                      ))}
                      {checkup.features.length > 4 && (
                        <li className="text-[10px] md:text-xs text-gray-500 italic pl-5">
                          + ещё {checkup.features.length - 4}
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Кнопка скрыта временно */}
                  {/* <button
                    onClick={() => handleBookAppointment(checkup.title)}
                    className="w-full bg-primary text-white py-1.5 md:py-2 rounded-lg font-semibold hover:bg-primaryDark transition-colors text-[10px] md:text-xs"
                  >
                    Записаться
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-dark">
              Организациям
            </h2>
            <div className="bg-gradient-to-r from-primary/10 to-primaryDark/10 rounded-xl p-8">
              <p className="text-lg text-gray-700 mb-6">
                Мы проводим медицинские осмотры для сотрудников организаций:
                предварительные (при приёме на работу) и периодические.
                
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Медосмотр при приёме на работу (форма 086/у)</li>
                <li>Периодические медосмотры для работающих</li>
                <li>Медосмотр для гос. службы (форма 001-ГС/у)</li>
                <li>Для работы с гос. тайной (форма 989н)</li>
                <li>В ГИБДД (форма 003-в/у)</li>
                <li>Для заселения в общежитие</li>
              </ul>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl mb-3">🏢</div>
                  <h3 className="font-semibold mb-2 text-dark">Для организаций</h3>
                  <p className="text-gray-600 text-sm">
                    Специальные цены и условия
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🚐</div>
                  <h3 className="font-semibold mb-2 text-dark">Выездные осмотры</h3>
                  <p className="text-gray-600 text-sm">
                    Мобильная бригада врачей
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📑</div>
                  <h3 className="font-semibold mb-2 text-dark">Документы</h3>
                  <p className="text-gray-600 text-sm">
                    Полный пакет закрывающих документов
                  </p>
                </div>
              </div>
              <div className="text-center">
                <a
                  href="tel:+73953123456"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primaryDark transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +7 (923) 381-60-60
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialists */}
      <section id="specialists" className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4 text-dark">
            Врачи Клиники
          </h2>
          <p className="text-gray-600 text-center mb-8 md:mb-10 max-w-3xl mx-auto text-sm md:text-base">
            Врачи высшей категории с многолетним опытом работы в области
            профилактической медицины и профпатологии
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {specialists.map((specialist) => (
              <div
                key={specialist.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                <div className="h-28 md:h-36 bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center">
                  {(() => {
                    const photoUrl = specialist.image;
                    return photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt={specialist.name}
                          className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full object-cover object-[50%_30%] border-2 md:border-3 lg:border-4 border-white"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const nextElement = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = "flex";
                            }
                          }}
                        />
                        <div
                          className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
                          style={{ display: "none" }}
                        >
                          <svg
                            className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-3 md:p-4 flex flex-col flex-grow">
                  <h3 className="text-sm md:text-base lg:text-lg font-semibold text-dark mb-1 md:mb-1.5 leading-tight">
                    {specialist.name}
                  </h3>
                  <p className="text-primary font-medium mb-2 text-xs md:text-sm">
                    {specialist.specialty}
                  </p>
                  <div className="flex items-center text-gray-600 mt-auto">
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs md:text-sm">{specialist.experience} лет опыта</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
          
          {/* Кнопка "Все врачи" */}
          <div className="mt-6 md:mt-8 text-center">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primaryDark transition-colors text-sm md:text-base"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              Все врачи
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primaryDark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Остались вопросы?</h2>
          <p className="text-xl mb-8 opacity-90">
            Свяжитесь с нами — мы поможем подобрать подходящий вид медосмотра
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+79233816060"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              +7 (923) 381-60-60
            </a>
            <button
              onClick={() => handleBookAppointment('Консультация')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Заказать звонок
            </button>
          </div>
        </div>
      </section>

      {/* Detailed Price Table */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-dark">Подробный прайс-лист</h2>
            <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
              Многопрофильный медицинский центр "Алдан"<br/>
              Телефон: +7 (923) 381-60-60 | E-mail: clinic@aldan@mail.ru
            </p>

            {/* Госслужба */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
                <span>🏛️</span> Государственная служба (форма 001-ГС/у)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">№ п/п</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Наименование услуги</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Код МЗ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Цена</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">1</td>
                      <td className="px-4 py-3 text-sm">Госслужба 001 — Женщины без анализов до 40 лет</td>
                      <td className="px-4 py-3 text-sm text-gray-600">001-ГС/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">5 150 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">2</td>
                      <td className="px-4 py-3 text-sm">Госслужба 001 — Мужчины без анализов до 40 лет</td>
                      <td className="px-4 py-3 text-sm text-gray-600">001-ГС/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">4 950 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">3</td>
                      <td className="px-4 py-3 text-sm">Госслужба 001 — Женщины с анализами до 40 лет</td>
                      <td className="px-4 py-3 text-sm text-gray-600">001-ГС/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">9 040 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">4</td>
                      <td className="px-4 py-3 text-sm">Госслужба 001 — Мужчины с анализами до 40 лет</td>
                      <td className="px-4 py-3 text-sm text-gray-600">001-ГС/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">8 280 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">5</td>
                      <td className="px-4 py-3 text-sm">Госслужба 001 — Женщины с анализами от 40 лет</td>
                      <td className="px-4 py-3 text-sm text-gray-600">001-ГС/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">14 385 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">6</td>
                      <td className="px-4 py-3 text-sm">Госслужба 001 — Мужчины с анализами от 40 лет</td>
                      <td className="px-4 py-3 text-sm text-gray-600">001-ГС/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">11 705 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">7</td>
                      <td className="px-4 py-3 text-sm">Госслужба 001 — Женщины без анализов от 40 лет</td>
                      <td className="px-4 py-3 text-sm text-gray-600">001-ГС/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">6 850 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">8</td>
                      <td className="px-4 py-3 text-sm">Госслужба 001 — Мужчины без анализов от 40 лет</td>
                      <td className="px-4 py-3 text-sm text-gray-600">001-ГС/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">4 950 ₽</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Санаторно-курортные карты */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
                <span>📋</span> Санаторно-курортные карты (форма 072/у)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">№ п/п</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Наименование услуги</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Код МЗ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Цена</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">1</td>
                      <td className="px-4 py-3 text-sm">Санаторно-курортная карта женщины</td>
                      <td className="px-4 py-3 text-sm text-gray-600">072/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">7 650 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">2</td>
                      <td className="px-4 py-3 text-sm">Санаторно-курортная карта мужчины</td>
                      <td className="px-4 py-3 text-sm text-gray-600">072/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">4 100 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">3</td>
                      <td className="px-4 py-3 text-sm">Санаторно-курортная карта дети</td>
                      <td className="px-4 py-3 text-sm text-gray-600">072/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">4 720 ₽</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Справки 086/у */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
                <span>🎓</span> Справки для ВУЗов (форма 086/у)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">№ п/п</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Наименование услуги</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Код МЗ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Цена</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">1</td>
                      <td className="px-4 py-3 text-sm">Справка 086/у женщины</td>
                      <td className="px-4 py-3 text-sm text-gray-600">086/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">4 850 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">2</td>
                      <td className="px-4 py-3 text-sm">Справка 086/у мужчины</td>
                      <td className="px-4 py-3 text-sm text-gray-600">086/у</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">4 450 ₽</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Водительские справки */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
                <span>🚗</span> Водительские справки
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">№ п/п</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Наименование услуги</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Код</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Цена</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">1</td>
                      <td className="px-4 py-3 text-sm">Водительская справка категории "В" или "ВЕ", подкатегории "В1"</td>
                      <td className="px-4 py-3 text-sm text-gray-600">005</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">2 500 ₽</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">2</td>
                      <td className="px-4 py-3 text-sm">Водительская справка категорий "С", "D", "СЕ", "DE" и др.</td>
                      <td className="px-4 py-3 text-sm text-gray-600">006</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-primary">4 800 ₽</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Примечание */}
            <div className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-bold text-dark mb-3">Примечание:</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Цены указаны без учёта НДС (работаем по упрощённой системе налогообложения)</li>
                <li>• Стоимость медосмотра зависит от пола, возраста и необходимого перечня анализов</li>
                <li>• Для организаций доступны специальные цены при групповых медосмотрах</li>
                <li>• По желанию можно расширить программу обследования дополнительными исследованиями</li>
                <li>• Результаты медосмотра готовы через 1-3 рабочих дня</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Modal */}
      {isModalOpen && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
