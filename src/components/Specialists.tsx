import React, { useState } from "react";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  image: string;
  description: string;
  education: string[];
  languages: string[];
  isAvailable: boolean;
  price: string;
}

export default function Specialists() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  const specialties = [
    "all",
    "Терапевт",
    "Кардиолог",
    "Невролог",
    "Офтальмолог",
    "Стоматолог",
    "Дерматолог",
    "Гинеколог",
    "Уролог",
    "Эндокринолог",
    "Педиатр",
  ];

  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Иванова Анна Петровна",
      specialty: "Терапевт",
      experience: 15,
      rating: 4.9,
      image: "/images/doctor1.jpg",
      description:
        "Высококвалифицированный терапевт с большим опытом работы. Специализируется на лечении и профилактике заболеваний внутренних органов.",
      education: [
        "МГМУ им. И.М. Сеченова",
        "Клиническая ординатура по терапии",
      ],
      languages: ["Русский", "Английский"],
      isAvailable: true,
      price: "2 500 ₽",
    },
    {
      id: 2,
      name: "Петров Сергей Владимирович",
      specialty: "Кардиолог",
      experience: 20,
      rating: 4.8,
      image: "/images/doctor2.jpg",
      description:
        "Ведущий кардиолог клиники. Специализируется на лечении ишемической болезни сердца, аритмий и гипертонии.",
      education: ["РНИМУ им. Н.И. Пирогова", "Доктор медицинских наук"],
      languages: ["Русский", "Немецкий"],
      isAvailable: true,
      price: "3 500 ₽",
    },
    {
      id: 3,
      name: "Смирнова Елена Александровна",
      specialty: "Невролог",
      experience: 12,
      rating: 4.7,
      image: "/images/doctor3.jpg",
      description:
        "Специалист по лечению заболеваний нервной системы. Владеет современными методами диагностики и лечения.",
      education: ["СПбГМУ им. И.П. Павлова", "Кандидат медицинских наук"],
      languages: ["Русский", "Французский"],
      isAvailable: true,
      price: "2 800 ₽",
    },
    {
      id: 4,
      name: "Козлов Дмитрий Игоревич",
      specialty: "Офтальмолог",
      experience: 18,
      rating: 4.9,
      image: "/images/doctor4.jpg",
      description:
        "Эксперт в области диагностики и лечения заболеваний глаз. Проводит лазерные операции и коррекцию зрения.",
      education: ["МГМСУ им. А.И. Евдокимова", "Профессор"],
      languages: ["Русский", "Английский", "Испанский"],
      isAvailable: true,
      price: "3 200 ₽",
    },
    {
      id: 5,
      name: "Волкова Мария Сергеевна",
      specialty: "Стоматолог",
      experience: 10,
      rating: 4.8,
      image: "/images/doctor5.jpg",
      description:
        "Специалист по эстетической стоматологии и имплантации. Владеет современными методиками лечения.",
      education: ["МГМСУ им. А.И. Евдокимова", "Кандидат медицинских наук"],
      languages: ["Русский", "Английский"],
      isAvailable: true,
      price: "2 900 ₽",
    },
    {
      id: 6,
      name: "Белов Александр Николаевич",
      specialty: "Дерматолог",
      experience: 14,
      rating: 4.7,
      image: "/images/doctor6.jpg",
      description:
        "Эксперт в области дерматологии и косметологии. Специализируется на лечении кожных заболеваний.",
      education: ["РНИМУ им. Н.И. Пирогова", "Доктор медицинских наук"],
      languages: ["Русский", "Английский"],
      isAvailable: true,
      price: "2 600 ₽",
    },
    {
      id: 7,
      name: "Григорьева Ольга Викторовна",
      specialty: "Гинеколог",
      experience: 16,
      rating: 4.9,
      image: "/images/doctor7.jpg",
      description:
        "Специалист по гинекологии и репродуктологии. Владеет современными методами диагностики и лечения.",
      education: ["МГМУ им. И.М. Сеченова", "Профессор"],
      languages: ["Русский", "Английский"],
      isAvailable: true,
      price: "3 000 ₽",
    },
    {
      id: 8,
      name: "Морозов Иван Петрович",
      specialty: "Уролог",
      experience: 13,
      rating: 4.8,
      image: "/images/doctor8.jpg",
      description:
        "Специалист по урологии и андрологии. Проводит современные методы диагностики и лечения.",
      education: ["СПбГМУ им. И.П. Павлова", "Кандидат медицинских наук"],
      languages: ["Русский", "Английский"],
      isAvailable: true,
      price: "2 700 ₽",
    },
    {
      id: 9,
      name: "Соколова Татьяна Михайловна",
      specialty: "Эндокринолог",
      experience: 17,
      rating: 4.9,
      image: "/images/doctor9.jpg",
      description:
        "Эксперт в области эндокринологии. Специализируется на лечении сахарного диабета и заболеваний щитовидной железы.",
      education: ["МГМУ им. И.М. Сеченова", "Доктор медицинских наук"],
      languages: ["Русский", "Английский", "Немецкий"],
      isAvailable: true,
      price: "3 100 ₽",
    },
    {
      id: 10,
      name: "Кузнецов Андрей Сергеевич",
      specialty: "Педиатр",
      experience: 11,
      rating: 4.8,
      image: "/images/doctor10.jpg",
      description:
        "Специалист по педиатрии. Владеет современными методами диагностики и лечения детских заболеваний.",
      education: ["РНИМУ им. Н.И. Пирогова", "Кандидат медицинских наук"],
      languages: ["Русский", "Английский"],
      isAvailable: true,
      price: "2 400 ₽",
    },
  ];

  const filteredDoctors =
    selectedSpecialty === "all"
      ? doctors
      : doctors.filter((doctor) => doctor.specialty === selectedSpecialty);

  return (
    <section className="py-12 bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Наши специалисты
        </h2>

        {/* Specialty filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-4 py-2 rounded-full ${
                selectedSpecialty === specialty
                  ? "bg-teal text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {specialty === "all" ? "Все специалисты" : specialty}
            </button>
          ))}
        </div>

        {/* Doctors grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-64 object-cover"
                />
                {doctor.isAvailable && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Доступен
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{doctor.name}</h3>
                <div className="flex items-center mb-2">
                  <span className="text-gray-600">{doctor.specialty}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600">
                    {doctor.experience} лет опыта
                  </span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(doctor.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">{doctor.rating}</span>
                </div>
                <p className="text-gray-600 mb-4">{doctor.description}</p>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Образование:</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {doctor.education.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Языки:</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">{doctor.price}</span>
                  <button className="bg-teal text-white px-6 py-2 rounded-md hover:bg-teal/90 transition-colors">
                    Записаться
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
