import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import prodoctorovData from "../data/prodoctorov.json";
import archimedService from "../services/archimed";
import type { ArchimedDoctor } from "../types/cms";
import AppointmentModal from "./AppointmentModal";
import { SeoHead } from "./SeoHead";

// Создаем мапу фото из prodoctorov.json
const doctorPhotoMap = new Map<string, string>();
if (Array.isArray(prodoctorovData)) {
  prodoctorovData.forEach((doc: any) => {
    if (doc.fullName && doc.photo) {
      doctorPhotoMap.set(doc.fullName.toLowerCase(), doc.photo);
    }
  });
}

const DoctorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<ArchimedDoctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean;
    doctor?: ArchimedDoctor;
  }>({
    isOpen: false,
  });

  useEffect(() => {
    const loadDoctor = async () => {
      if (!id) {
        setError("ID врача не указан");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Сначала проверяем кэш
        const cachedDoctors = archimedService.getDoctorsCache();
        const cachedDoctor = cachedDoctors.find(
          (d) => d.id === Number.parseInt(id),
        );

        if (cachedDoctor) {
          setDoctor(cachedDoctor);
          setIsLoading(false);
          return;
        }

        // Если в кэше нет, загружаем с API
        const doctorData = await archimedService.getDoctor(Number.parseInt(id));
        setDoctor(doctorData);
      } catch (e) {
        console.error("Error loading doctor:", e);
        setError("Не удалось загрузить информацию о враче");
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctor();
  }, [id]);

  const handleAppointmentClick = () => {
    if (doctor) {
      setAppointmentModal({
        isOpen: true,
        doctor,
      });
    }
  };

  const handleAppointmentSuccess = () => {
    console.log("Appointment created successfully");
  };

  const getDoctorFullName = (doctor: ArchimedDoctor) => {
    return `${doctor.name} ${doctor.name1} ${doctor.name2}`;
  };

  const getDoctorInitials = (doctor: ArchimedDoctor) => {
    return `${doctor.name} ${doctor.name1?.charAt(0)}. ${doctor.name2?.charAt(0)}.`;
  };

  // Получение фото врача: приоритеты
  const getDoctorPhoto = (doctor: ArchimedDoctor): string | null => {
    if (doctor.photo && doctor.photo.length > 10) {
      if (doctor.photo.startsWith("http") || doctor.photo.startsWith("/")) {
        return doctor.photo;
      }
      if (doctor.photo.length > 50) {
        return doctor.photo.startsWith("data:")
          ? doctor.photo
          : `data:image/bmp;base64,${doctor.photo}`;
      }
    }

    const fullName = getDoctorFullName(doctor).toLowerCase();
    return doctorPhotoMap.get(fullName) || null;
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о враче...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            Врач не найден
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Информация о враче недоступна"}
          </p>
          <Link
            to="/doctors"
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primaryDark transition-colors"
          >
            Вернуться к списку врачей
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO мета-теги для страницы врача */}
      <SeoHead
        pageData={{
          title: `${getDoctorFullName(doctor)} — ${formatSpecialtyName(doctor.type)} в Кызыле | Клиника Алдан`,
          description: `${getDoctorFullName(doctor)}, ${formatSpecialtyName(doctor.type)}. Запись на прием в Клинике Алдан по телефону +7 (923) 317-60-60. Высококвалифицированный специалист с многолетним опытом работы.`,
          canonical: `/doctors/${doctor.id}`,
          ogType: "profile",
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4]">
        {/* Back button */}
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-primary hover:text-primaryDark text-sm font-medium group"
          >
            <svg
              className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Назад к списку врачей
          </button>
        </div>

        {/* Основная информация о враче */}
        <section className="py-8 sm:py-10 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {/* Фото врача */}
                <div className="md:col-span-1">
                  <div className="w-full h-80 bg-white rounded-2xl shadow-lg overflow-hidden">
                    {(() => {
                      const photoUrl = getDoctorPhoto(doctor);
                      return photoUrl ? (
                        <>
                          <img
                            src={photoUrl}
                            alt={getDoctorFullName(doctor)}
                            className="w-full h-full object-cover object-[50%_30%]"
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
                            className="w-full h-full flex items-center justify-center text-gray-400"
                            style={{ display: "none" }}
                          >
                            <div className="text-center p-4">
                              <svg
                                className="w-16 h-16 mx-auto mb-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <p className="text-sm">Фото недоступно</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primaryDark/20">
                          <div className="text-center p-4">
                            <svg
                              className="w-16 h-16 mx-auto mb-2 text-primary"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-sm text-primary">Фото отсутствует</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Информация о враче */}
                <div className="md:col-span-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                    {getDoctorFullName(doctor)}
                  </h1>

                  <div className="space-y-5">
                    {/* Основная специализация */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/10">
                      <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                        Специализация
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {formatSpecialtyName(doctor.type)}
                      </p>
                    </div>

                    {/* Категория */}
                    {doctor.category && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/10">
                        <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Категория
                        </h3>
                        <p className="text-gray-900">
                          {formatSpecialtyName(doctor.category)}
                        </p>
                      </div>
                    )}

                    {/* Ученая степень */}
                    {doctor.scientific_degree && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/10">
                        <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Ученая степень
                        </h3>
                        <p className="text-gray-900">
                          {doctor.scientific_degree}
                        </p>
                      </div>
                    )}

                    {/* Время приема */}
                    {doctor.max_time && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/10">
                        <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Время приема
                        </h3>
                        <p className="text-gray-900">{doctor.max_time} минут</p>
                      </div>
                    )}

                    {/* Отделение */}
                    {doctor.branch && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/10">
                        <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Отделение
                        </h3>
                        <p className="text-gray-900">{doctor.branch}</p>
                      </div>
                    )}

                    {/* Адрес */}
                    {doctor.address && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/10">
                        <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Адрес
                        </h3>
                        <p className="text-gray-900">{doctor.address}</p>
                      </div>
                    )}

                    {/* Дополнительная информация */}
                    {doctor.info && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/10">
                        <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                          Дополнительная информация
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">
                          {doctor.info}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Кнопка записи */}
                  <div className="mt-8">
                    <button
                      onClick={handleAppointmentClick}
                      className="w-full px-8 py-3 bg-white border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Записаться на прием
                    </button>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Запишитесь на прием к врачу через онлайн-форму
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Все специализации врача */}
        {doctor.types && doctor.types.length > 1 && (
          <section className="py-8 sm:py-10 md:py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Все специализации
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {doctor.types.map((type) => (
                    <div
                      key={type.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-primary/10 hover:shadow-md transition-shadow"
                    >
                      <p className="text-gray-700 font-medium">
                        {formatSpecialtyName(type.name)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Модальное окно записи на прием */}
        <AppointmentModal
          isOpen={appointmentModal.isOpen}
          onClose={() => setAppointmentModal({ isOpen: false })}
          doctor={appointmentModal.doctor}
          onSuccess={handleAppointmentSuccess}
        />
      </div>
    </>
  );
};

export default DoctorDetailsPage;
