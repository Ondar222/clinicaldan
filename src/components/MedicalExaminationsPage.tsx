import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import prodoctorovData from "../data/prodoctorov.json";
import archimedService from "../services/archimed";
import type { ArchimedDoctor } from "../types/cms";
import { getDoctorExperience } from "../utils/doctorExperience";
import AppointmentModal from "./AppointmentModal";

interface CheckupType {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  icon: string;
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
    id: "sanatorium",
    title: "Для санаторно-курортного лечения",
    description:
      "Справка по форме №070/у. Обследование для получения путёвки в санаторий.",
    price: 2200,
    duration: "1-2 дня",
    features: [
      "Осмотр терапевтом",
      "Общий анализ крови",
      "Общий анализ мочи",
      "Флюорография",
      "ЭКГ",
      "Осмотр гинеколога (для женщин)",
    ],
    icon: "🏖️",
  },
  {
    id: "vuz",
    title: "Для поступления в ВУЗы, ССУЗы",
    description: "Справка по форме №086/у. Для абитуриентов при поступлении.",
    price: 1800,
    duration: "1-2 дня",
    features: [
      "Осмотр терапевтом",
      "Осмотр хирургом",
      "Осмотр неврологом",
      "Осмотр офтальмологом",
      "Осмотр ЛОРом",
      "Флюорография",
      "Общий анализ крови",
      "Общий анализ мочи",
    ],
    icon: "🎓",
  },
  {
    id: "sanatorium-card",
    title: "Санаторно-курортная карта",
    description:
      "По форме №072/у. Комплексное обследование для лечения в санатории.",
    price: 3500,
    duration: "2-3 дня",
    features: [
      "Осмотр терапевтом",
      "Общий анализ крови",
      "Общий анализ мочи",
      "Биохимия крови",
      "Флюорография",
      "ЭКГ",
      "УЗИ органов брюшной полости",
      "Осмотр гинеколога (для женщин)",
    ],
    icon: "📋",
  },
  {
    id: "investigative",
    title: "В Следственный комитет",
    description: "По форме 500. Для сотрудников и кандидатов в СК.",
    price: 2500,
    duration: "1-2 дня",
    features: [
      "Осмотр терапевтом",
      "Осмотр неврологом",
      "Осмотр психиатром",
      "Осмотр наркологом",
      "Офтальмология",
      "Флюорография",
      "Анализы крови и мочи",
    ],
    icon: "⚖️",
  },
  {
    id: "gibdd",
    title: "В ГИБДД",
    description:
      "По форме №003-в/у. Для получения/замены водительского удостоверения.",
    price: 1800,
    duration: "1-2 часа",
    features: [
      "Осмотр терапевтом",
      "Осмотр офтальмологом",
      "Осмотр неврологом",
      "Осмотр психиатром",
      "Осмотр наркологом",
    ],
    icon: "🚗",
  },
  {
    id: "civil-service",
    title: "При поступлении на гос.службу",
    description:
      "По форме № 001-ГС/у. Для кандидатов на государственную службу.",
    price: 2000,
    duration: "1-2 дня",
    features: [
      "Осмотр терапевтом",
      "Осмотр неврологом",
      "Осмотр психиатром",
      "Осмотр наркологом",
      "Флюорография",
      "Анализы крови и мочи",
    ],
    icon: "🏛️",
  },
  {
    id: "pool",
    title: "В бассейн",
    description: "По форме № 083/4-89. Справка для посещения бассейна.",
    price: 800,
    duration: "1 час",
    features: [
      "Осмотр терапевтом",
      "Соскоб на энтеробиоз",
      "Анализ на яйцеглист",
    ],
    icon: "🏊",
  },
  {
    id: "dormitory",
    title: "При заселении в общежитие",
    description: "По форме № 20. Для студентов и работников при заселении.",
    price: 1200,
    duration: "1 день",
    features: [
      "Осмотр терапевтом",
      "Флюорография",
      "Анализ крови",
      "Осмотр дерматолога",
    ],
    icon: "🏠",
  },
  {
    id: "foreign-vuz",
    title: "Для поступления в ВУЗы, ССУЗы (заграничные)",
    description: "По международной форме. Для обучения за рубежом.",
    price: 4500,
    duration: "2-3 дня",
    features: [
      "Осмотр терапевтом",
      "Осмотр хирургом",
      "Осмотр неврологом",
      "Осмотр офтальмологом",
      "Осмотр ЛОРом",
      "Флюорография",
      "Развёрнутые анализы крови",
      "Перевод на иностранный язык",
    ],
    icon: "🌍",
  },
  {
    id: "state-secret",
    title: "Для работы с гос. тайной",
    description: "Справка по форме №989н. Для допуска к секретной информации.",
    price: 2800,
    duration: "1-2 дня",
    features: [
      "Осмотр терапевтом",
      "Осмотр неврологом",
      "Осмотр психиатром",
      "Осмотр наркологом",
      "Флюорография",
      "Анализы крови и мочи",
      "ЭКГ",
    ],
    icon: "🔒",
  },
  {
    id: "employment",
    title: "При приеме на работу",
    description: "По форме №086/у. Для лиц старше 18 лет.",
    price: 2500,
    duration: "1-2 дня",
    features: [
      "Осмотр терапевтом",
      "Осмотр хирургом",
      "Осмотр неврологом",
      "Осмотр офтальмологом",
      "Осмотр ЛОРом",
      "Флюорография",
      "Общий анализ крови",
      "Общий анализ мочи",
    ],
    icon: "💼",
  },
];

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

const getDoctorFullName = (doctor: ArchimedDoctor): string => {
  return `${doctor.name} ${doctor.name1} ${doctor.name2}`.trim();
};

const getDoctorPhotoUrl = (doctor: ArchimedDoctor): string => {
  if (doctor.photo && doctor.photo.startsWith("http")) {
    return doctor.photo;
  }
  if (doctor.photo && doctor.photo.startsWith("/")) {
    return doctor.photo;
  }
  if (doctor.photo && doctor.photo.length > 50) {
    return doctor.photo.startsWith("data:")
      ? doctor.photo
      : `data:image/bmp;base64,${doctor.photo}`;
  }

  const fullName = getDoctorFullName(doctor).toLowerCase();
  const photoFromMap = doctorPhotoMap.get(fullName);
  if (photoFromMap) {
    return photoFromMap.startsWith("/") ? photoFromMap : photoFromMap;
  }

  const initials =
    `${doctor.name1?.charAt(0) || ""}${doctor.name2?.charAt(0) || ""}`.toUpperCase();
  return `https://placehold.co/300x400/e0f2f1/00695c?text=${initials || "Врач"}`;
};

const getDoctorInitials = (doctor: ArchimedDoctor) => {
  return `${doctor.name} ${doctor.name1?.charAt(0)}. ${doctor.name2?.charAt(0)}.`;
};

const getExperienceYears = (doctor: ArchimedDoctor): number | undefined => {
  return getDoctorExperience(doctor);
};

const formatSpecialtyName = (raw: string | undefined | null): string => {
  const s = (raw || "").trim();
  if (!s) return "Врач";
  if (/^врач/i.test(s)) {
    const tail = s.slice(5);
    const spaced = tail.replace(/^([^\s-])/u, " $1");
    return `Врач${spaced}`;
  }
  if (/функционал/i.test(s) && /диагност/i.test(s)) {
    return "Врач функциональной диагностики";
  }
  return `Врач ${s}`;
};

export default function MedicalExaminationsPage() {
  const [selectedCheckup, setSelectedCheckup] = useState<CheckupType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCheckupTitle, setSelectedCheckupTitle] = useState<string>("");
  const [doctors, setDoctors] = useState<ArchimedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean;
    doctor?: ArchimedDoctor;
  }>({
    isOpen: false,
  });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorsData = await archimedService.getDoctors();
        const filtered = doctorsData
          .filter(
            (d) =>
              d.name &&
              d.name.trim() !== "" &&
              !/массажист/i.test(d?.type || "") &&
              !/(администратор|archimed|арбаев)/i.test(
                `${d?.name || ""} ${d?.name1 || ""} ${d?.name2 || ""}`.toLowerCase(),
              ),
          )
          .slice(0, 8);
        setDoctors(filtered);
      } catch (error) {
        console.error("Error loading doctors:", error);
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
    setSelectedCheckupTitle("");
  };

  const handleAppointmentClick = (doctor?: ArchimedDoctor) => {
    setAppointmentModal({
      isOpen: true,
      doctor,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primaryDark text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              Центр медосмотров
            </h1>
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4 text-dark">
            Виды медосмотров
          </h2>
          <p className="text-gray-600 text-center mb-10 md:mb-12 max-w-3xl mx-auto text-sm md:text-base">
            Мы проводим все основные виды медицинских осмотров. Выберите
            подходящий вариант и запишитесь на приём.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {checkupTypes.map((checkup) => (
              <div
                key={checkup.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-primary to-primaryDark text-white p-4 md:p-6">
                  <div className="text-3xl md:text-4xl mb-2 md:mb-3">
                    {checkup.icon}
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-2">
                    {checkup.title}
                  </h3>
                  <p className="text-white/90 text-xs md:text-sm">
                    {checkup.description}
                  </p>
                </div>

                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <div>
                      <span className="text-gray-500 text-xs md:text-sm">
                        Стоимость:
                      </span>
                      <div className="text-lg md:text-2xl font-bold text-primary">
                        {formatPrice(checkup.price)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs md:text-sm">
                        Срок:
                      </span>
                      <div className="text-sm md:text-lg font-semibold text-dark">
                        {checkup.duration}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 md:mb-6">
                    <h4 className="font-semibold mb-2 md:mb-3 text-dark text-sm md:text-base">
                      В программу входит:
                    </h4>
                    <ul className="space-y-1.5 md:space-y-2">
                      {checkup.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-gray-600 text-xs md:text-sm"
                        >
                          <svg
                            className="w-4 h-4 md:w-5 md:h-5 text-green-500 mt-0.5 flex-shrink-0"
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
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBookAppointment(checkup.title)}
                    className="w-full bg-primary text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-primaryDark transition-colors text-sm md:text-base"
                  >
                    Записаться
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-dark">
              Организациям
            </h2>
            <div className="bg-gradient-to-r from-primary/10 to-primaryDark/10 rounded-xl p-6 md:p-8">
              <p className="text-sm md:text-lg text-gray-700 mb-4 md:mb-6">
                Мы проводим медицинские осмотры для сотрудников организаций:
                предварительные (при приёме на работу) и периодические.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 md:mb-6 space-y-1 md:space-y-2 text-sm md:text-base">
                <li>Медосмотр при приёме на работу (форма 086/у)</li>
                <li>Периодические медосмотры для работающих</li>
                <li>Медосмотр для гос. службы (форма 001-ГС/у)</li>
                <li>Для работы с гос. тайной (форма 989н)</li>
                <li>В ГИБДД (форма 003-в/у)</li>
                <li>Для заселения в общежитие</li>
              </ul>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl mb-2 md:mb-3">🏢</div>
                  <h3 className="font-semibold mb-1 md:mb-2 text-dark text-sm md:text-base">
                    Для организаций
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm">
                    Специальные цены и условия
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl mb-2 md:mb-3">🚐</div>
                  <h3 className="font-semibold mb-1 md:mb-2 text-dark text-sm md:text-base">
                    Выездные осмотры
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm">
                    Мобильная бригада врачей
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl mb-2 md:mb-3">📑</div>
                  <h3 className="font-semibold mb-1 md:mb-2 text-dark text-sm md:text-base">
                    Документы
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm">
                    Полный пакет закрывающих документов
                  </p>
                </div>
              </div>
              <div className="text-center">
                <a
                  href="tel:+73953123456"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-primaryDark transition-colors text-sm md:text-base"
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
          <p className="text-gray-600 text-center mb-10 md:mb-12 max-w-3xl mx-auto text-sm md:text-base">
            Врачи высшей категории с многолетним опытом работы в области
            профилактической медицины и профпатологии
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {doctors.map((doctor) => (
                <div
                  key={`doctor-${doctor.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                >
                  <div className="h-32 md:h-44 bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center">
                    {(() => {
                      const photoUrl = getDoctorPhotoUrl(doctor);
                      return photoUrl ? (
                        <>
                          <img
                            src={photoUrl}
                            alt={getDoctorFullName(doctor)}
                            className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full object-cover object-[50%_30%] border-2 md:border-3 lg:border-4 border-white"
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
                            className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
                            style={{ display: "none" }}
                          >
                            <svg
                              className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white"
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
                        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white"
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

                  <div className="p-3 md:p-4 lg:p-5 flex flex-col flex-grow">
                    <h3 className="text-sm md:text-base lg:text-lg font-semibold text-dark mb-1 md:mb-1.5 leading-tight">
                      {getDoctorFullName(doctor)}
                    </h3>
                    <p className="text-primary font-medium mb-2 text-xs md:text-sm">
                      {formatSpecialtyName(doctor.type)}
                    </p>

                    <div className="space-y-1 md:space-y-1.5 text-xs md:text-sm text-gray-600 mb-3 flex-grow">
                      {doctor.branch && !/алдан/i.test(doctor.branch || "") && (
                        <div className="flex items-center">
                          <svg
                            className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="leading-relaxed">
                            {doctor.branch}
                          </span>
                        </div>
                      )}
                      {(() => {
                        const years = getExperienceYears(doctor);
                        if (!years && years !== 0) return null;
                        return (
                          <div className="flex items-center">
                            <svg
                              className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="leading-relaxed">
                              Стаж: {years} лет
                            </span>
                          </div>
                        );
                      })()}
                      <div className="flex items-center">
                        <svg
                          className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="leading-relaxed">
                          Прием: {doctor.max_time} мин
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1 md:space-y-0 md:flex-row md:space-x-2 mt-auto">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="w-full md:w-auto px-3 md:px-4 py-1.5 md:py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors text-xs md:text-sm text-center"
                      >
                        Подробнее
                      </Link>
                      <button
                        onClick={() => handleAppointmentClick(doctor)}
                        className="w-full md:w-auto px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white hover:bg-primaryDark rounded-lg font-medium transition-colors text-xs md:text-sm"
                      >
                        Записаться
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary to-primaryDark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Остались вопросы?
          </h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90">
            Свяжитесь с нами — мы поможем подобрать подходящий вид медосмотра
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <a
              href="tel:+73953123456"
              className="bg-white text-primary px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 text-sm md:text-base"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              +7 (923) 381-60-60
            </a>
            <button
              onClick={() => handleBookAppointment("Консультация")}
              className="bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm md:text-base"
            >
              Заказать звонок
            </button>
          </div>
        </div>
      </section>

      {/* Appointment Modal */}
      {isModalOpen && (
        <AppointmentModal isOpen={isModalOpen} onClose={handleModalClose} />
      )}

      {/* Doctor Appointment Modal */}
      <AppointmentModal
        isOpen={appointmentModal.isOpen}
        onClose={() => setAppointmentModal({ isOpen: false })}
        doctor={appointmentModal.doctor}
      />
    </div>
  );
}
