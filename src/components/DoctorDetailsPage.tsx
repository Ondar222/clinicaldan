import type React from "react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import archimedService from "../services/archimed";
import type { ArchimedDoctor } from "../types/cms";
import AppointmentModal from "./AppointmentModal";

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
          (d) => d.id === Number.parseInt(id)
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
    <div className="min-h-screen bg-gray-50">
      {/* Хлебные крошки */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary">
              Главная
            </Link>
            <span>/</span>
            <Link to="/doctors" className="hover:text-primary">
              Врачи
            </Link>
            <span>/</span>
            <span className="text-gray-900">{getDoctorInitials(doctor)}</span>
          </nav>
        </div>
      </div>

      {/* Back to doctors list */}
      <div className="container mx-auto px-4 py-3">
        <Link
          to="/doctors"
          className="inline-flex items-center text-primary hover:text-primaryDark text-sm"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Назад к врачам
        </Link>
      </div>

      {/* Основная информация о враче */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Фото врача */}
              <div className="md:col-span-1">
                <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                  {doctor.photo ? (
                    <>
                      <img
                        src={
                          doctor.photo.startsWith("data:")
                            ? doctor.photo
                            : doctor.photo
                        }
                        alt={getDoctorFullName(doctor)}
                        className="w-full h-full object-cover object-center"
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
                        <div className="text-center">
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
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
                        <p>Фото отсутствует</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Информация о враче */}
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {getDoctorFullName(doctor)}
                </h1>

                <div className="space-y-4">
                  {/* Основная специализация */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Специализация
                    </h3>
                    <p className="text-gray-700">
                      {formatSpecialtyName(doctor.type)}
                    </p>
                  </div>

                  {/* Категория */}
                  {doctor.category && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Категория
                      </h3>
                      <p className="text-gray-700">
                        {formatSpecialtyName(doctor.category)}
                      </p>
                    </div>
                  )}

                  {/* Ученая степень */}
                  {doctor.scientific_degree && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ученая степень
                      </h3>
                      <p className="text-gray-700">
                        {doctor.scientific_degree}
                      </p>
                    </div>
                  )}

                  {/* Время приема по умолчанию */}
                  {doctor.max_time && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Время приема
                      </h3>
                      <p className="text-gray-700">{doctor.max_time} минут</p>
                    </div>
                  )}

                  {/* Отделение */}
                  {doctor.branch && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Отделение
                      </h3>
                      <p className="text-gray-700">{doctor.branch}</p>
                    </div>
                  )}

                  {/* Адрес */}
                  {doctor.address && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Адрес
                      </h3>
                      <p className="text-gray-700">{doctor.address}</p>
                    </div>
                  )}

                  {/* Дополнительная информация */}
                  {doctor.info && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Дополнительная информация
                      </h3>
                      <p className="text-gray-700 whitespace-pre-line">
                        {doctor.info}
                      </p>
                    </div>
                  )}
                </div>

                {/* Кнопка записи */}
                {/* <div className="mt-8">
                  <button
                    onClick={handleAppointmentClick}
                    className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primaryDark transition-colors"
                  >
                    Записаться на прием
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Все специализации врача */}
      {doctor.types && doctor.types.length > 1 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Все специализации
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctor.types.map((type) => (
                  <div
                    key={type.id}
                    className="bg-white p-4 rounded-lg shadow-sm"
                  >
                    <p className="text-gray-700">
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
  );
};

export default DoctorDetailsPage;
