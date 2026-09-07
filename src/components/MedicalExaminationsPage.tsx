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

// SVG иконки для медосмотров
const checkupIcons: Record<string, React.ReactNode> = {
  "sanatorium": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "vuz": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  "sanatorium-card": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "investigative": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  "gibdd": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  "civil-service": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  "pool": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "dormitory": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  "foreign-vuz": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "state-secret": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  "employment": (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

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
    icon: "sanatorium",
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
    icon: "vuz",
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
    icon: "sanatorium-card",
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
    icon: "investigative",
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
    icon: "gibdd",
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
    icon: "civil-service",
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
    icon: "pool",
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
    icon: "dormitory",
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
    icon: "foreign-vuz",
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
    icon: "state-secret",
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
    icon: "employment",
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
    <div className="relative min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] overflow-hidden">
      {/* Мягкие декоративные пятна */}
      <div className="fixed -left-20 top-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -right-10 bottom-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section
        className="py-10 sm:py-14 md:py-18 lg:py-20 bg-cover bg-center relative"
        style={{ backgroundImage: "url(/bg_8.avif)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <div className="inline-block mb-4 md:mb-6">
            <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            Центр медосмотров
          </h1>
          <p className="text-white/90 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
            Комплексные медицинские осмотры для граждан и организаций
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <a
              href="#checkups"
              className="bg-white/90 border-2 border-white/50 text-primary px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all text-sm md:text-base shadow-sm"
            >
              Виды медосмотров
            </a>
            <a
              href="#specialists"
              className="bg-white/90 border-2 border-white/50 text-primary px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all text-sm md:text-base shadow-sm"
            >
              Наши специалисты
            </a>
          </div>
        </div>
      </section>

      {/* Checkup Types */}
      <section id="checkups" className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4 bg-gradient-to-r from-dark to-primary bg-clip-text text-transparent">
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
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-primary/10"
              >
                <div className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary p-4 md:p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    {checkupIcons[checkup.icon]}
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-2">
                    {checkup.title}
                  </h3>
                  <p className="text-gray-700 text-xs md:text-sm">
                    {checkup.description}
                  </p>
                </div>

                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <div>
                      <span className="text-gray-500 text-xs md:text-sm">
                        Стоимость:
                      </span>
                      <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-primaryDark bg-clip-text text-transparent">
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
                            className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0"
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
                    className="w-full bg-white/90 backdrop-blur-sm border-2 border-primary/30 text-primary py-2.5 md:py-3 rounded-xl font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 text-sm md:text-base shadow-sm hover:shadow-md"
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
      <section className="py-8 sm:py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 bg-gradient-to-r from-dark to-primary bg-clip-text text-transparent">
              Организациям
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-primary/10 shadow-sm">
              <p className="text-sm md:text-lg text-gray-700 mb-4 md:mb-6">
                Мы проводим медицинские осмотры для сотрудников организаций:
                предварительные (при приёме на работу) и периодические.
              </p>
              <ul className="space-y-1 md:space-y-2 text-gray-700 mb-4 md:mb-6 text-sm md:text-base">
                {["Медосмотр при приёме на работу (форма 086/у)", "Периодические медосмотры для работающих", "Медосмотр для гос. службы (форма 001-ГС/у)", "Для работы с гос. тайной (форма 989н)", "В ГИБДД (форма 003-в/у)", "Для заселения в общежитие"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {[
                  { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />, title: "Для организаций", desc: "Специальные цены и условия" },
                  { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />, title: "Выездные осмотры", desc: "Мобильная бригада врачей" },
                  { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, title: "Документы", desc: "Полный пакет закрывающих документов" },
                ].map((item, i) => (
                  <div key={i} className="text-center bg-gradient-to-br from-[#fdf2f4] to-white rounded-xl p-4 border border-primary/10">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                    </div>
                    <h3 className="font-semibold mb-1 md:mb-2 text-dark text-sm md:text-base">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <a
                  href="tel:+79233816060"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primaryDark text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm md:text-base shadow-md"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +7 (923) 381-60-60
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialists */}
      <section id="specialists" className="py-8 sm:py-10 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4 bg-gradient-to-r from-dark to-primary bg-clip-text text-transparent">
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
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-primary/10 flex flex-col h-full"
                >
                  <div className="h-32 md:h-44 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    {(() => {
                      const photoUrl = getDoctorPhotoUrl(doctor);
                      return photoUrl ? (
                        <>
                          <img
                            src={photoUrl}
                            alt={getDoctorFullName(doctor)}
                            className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full object-cover object-[50%_30%] border-2 md:border-3 lg:border-4 border-white/80 shadow-lg"
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
                            className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 flex items-center justify-center"
                            style={{ display: "none" }}
                          >
                            <svg
                              className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary"
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
                        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary"
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
                            className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0 text-primary"
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
                              className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0 text-primary"
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
                          className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0 text-primary"
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
                        className="w-full md:w-auto px-3 md:px-4 py-1.5 md:py-2 border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-xl font-medium transition-all text-xs md:text-sm text-center shadow-sm"
                      >
                        Подробнее
                      </Link>
                      <button
                        onClick={() => handleAppointmentClick(doctor)}
                        className="w-full md:w-auto px-3 md:px-4 py-1.5 md:py-2 bg-white/90 border-2 border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary rounded-xl font-medium transition-all text-xs md:text-sm shadow-sm"
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
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-[#fdf2f4]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-primary/10 shadow-sm">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-dark to-primary bg-clip-text text-transparent">
              Остались вопросы?
            </h2>
            <p className="text-base md:text-xl mb-6 md:mb-8 text-gray-600">
              Свяжитесь с нами — мы поможем подобрать подходящий вид медосмотра
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <a
                href="tel:+79233816060"
                className="bg-gradient-to-r from-primary to-primaryDark text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2 text-sm md:text-base shadow-md"
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
                className="bg-white/90 border-2 border-primary/30 text-primary px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all text-sm md:text-base shadow-sm hover:shadow-md"
              >
                Заказать звонок
              </button>
            </div>
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
