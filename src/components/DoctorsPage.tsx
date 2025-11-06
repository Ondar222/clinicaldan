import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type {
  ArchimedDoctor,
  ArchimedBranch,
  ArchimedCategory,
  ApiService,
} from "../types/cms";
import archimedService from "../services/archimed";
import ErrorComponent from "./ErrorComponent";
import AppointmentModal from "./AppointmentModal";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<ArchimedDoctor[]>([]);
  const [branches, setBranches] = useState<ArchimedBranch[]>([]);
  const [categories, setCategories] = useState<ArchimedCategory[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;
  const [doctorServicesCount, setDoctorServicesCount] = useState<
    Record<number, number>
  >({});
  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean;
    service?: import("../types/cms").ApiService;
    doctor?: ArchimedDoctor;
  }>({
    isOpen: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Начинаем загрузку данных...");

        const [doctorsData, branchesData, categoriesData, servicesData] =
          await Promise.all([
            archimedService.getDoctors(),
            archimedService.getBranches(),
            archimedService
              .getCategories()
              .catch(() => [] as unknown as ArchimedCategory[]),
            archimedService
              .getServices()
              .catch(() => [] as unknown as ApiService[]),
          ]);

        console.log("Loaded doctors:", doctorsData);
        console.log("Loaded branches:", branchesData);
        console.log("Loaded categories:", categoriesData);
        console.log("Doctors count:", doctorsData?.length || 0);

        setDoctors(doctorsData || []);
        setBranches(branchesData || []);
        setCategories(categoriesData || []);
        // Build simple specialty-based mapping of services to doctors
        try {
          const norm = (s: string) =>
            (s || "").toLowerCase().replace(/ё/g, "е");
          const toks = (s: string) => norm(s).split(/\s+/).filter(Boolean);
          const svcTokensList = (servicesData as ApiService[]).map((s) => ({
            s,
            set: new Set<string>([...toks(s.group_name), ...toks(s.name)]),
          }));
          const counts: Record<number, number> = {};
          (doctorsData || []).forEach((d: ArchimedDoctor) => {
            const docTokens = new Set<string>([
              ...toks(d.type),
              ...(d.types || []).flatMap((t) => toks(t.name)),
            ]);
            let count = 0;
            for (const { set } of svcTokensList) {
              let matched = false;
              for (const t of docTokens) {
                if (set.has(t)) {
                  matched = true;
                  break;
                }
              }
              if (matched) count++;
            }
            if (count > 0) counts[d.id] = count;
          });
          setDoctorServicesCount(counts);
        } catch {}
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить данные о врачах. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const normalize = (value: string | number | null | undefined) =>
    value?.toString() || "";
  const normalizeRu = (s: string) =>
    s
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9]+/g, " ") // убрать лишние символы
      .trim();
  const searchWords = normalizeRu(normalize(searchTerm))
    .split(/\s+/)
    .filter(Boolean);

  const safeDoctors: ArchimedDoctor[] = Array.isArray(doctors) ? doctors : [];
  const filteredDoctors: ArchimedDoctor[] = safeDoctors.filter(
    (doctor: ArchimedDoctor) => {
      // Hide massage therapists
      const isMassage =
        /массажист/i.test(doctor?.type || "") ||
        (doctor?.types || []).some((t) => /массажист/i.test(t.name || ""));
      if (isMassage) return false;

      // Hide admin/test entries (e.g., Администратор ArchiMed+, Арбаев)
      const nameBlob =
        `${doctor?.name || ""} ${doctor?.name1 || ""} ${doctor?.name2 || ""} ${doctor?.info || ""}`.toLowerCase();
      if (/(администратор|archimed|арбаев)/i.test(nameBlob)) return false;
      const matchesBranch =
        selectedBranch === "all" ||
        String(doctor?.branch_id) === selectedBranch;
      const matchesCategory =
        selectedCategory === "all" ||
        String(doctor?.category_id) === selectedCategory;

      const haystack = [
        doctor?.name,
        doctor?.name1,
        doctor?.name2,
        doctor?.type,
        doctor?.branch,
        doctor?.category,
        ...(doctor?.types || []).map((t) => t.name),
      ]
        .map((v) => normalizeRu(normalize(v)))
        .join(" ");

      const matchesSearch =
        searchWords.length === 0 ||
        searchWords.every((w) => haystack.includes(w));

      return matchesBranch && matchesCategory && matchesSearch;
    }
  );

  // Reset to first page when filters/search change or doctors update
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBranch, selectedCategory, searchTerm, doctors.length]);

  const totalPages = Math.max(
    1,
    Math.ceil((filteredDoctors.length || 0) / pageSize)
  );
  const pageStartIndex = (currentPage - 1) * pageSize;
  const pageEndIndex = pageStartIndex + pageSize;
  const paginatedDoctors =
    filteredDoctors?.slice(pageStartIndex, pageEndIndex) || [];

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    scrollToTop();
  };

  const getDoctorFullName = (doctor: ArchimedDoctor) => {
    return `${doctor.name} ${doctor.name1} ${doctor.name2}`;
  };

  const getDoctorInitials = (doctor: ArchimedDoctor) => {
    return `${doctor?.name} ${doctor?.name1?.charAt(0)}. ${doctor?.name2?.charAt(0)}.`;
  };

  const getExperienceYears = (doctor: ArchimedDoctor): number | undefined => {
    const info = doctor?.info || "";
    const m =
      info.match(/стаж\s+с\s+(\d{4})/i) ||
      info.match(/Врачебный\s+стаж\s+с\s+(\d{4})/i);
    if (m && m[1]) {
      const start = parseInt(m[1], 10);
      if (!isNaN(start) && start > 1900 && start <= new Date().getFullYear()) {
        return Math.max(0, new Date().getFullYear() - start);
      }
    }
    return undefined;
  };

  const formatSpecialtyName = (raw: string | undefined | null): string => {
    const s = (raw || "").trim();
    if (!s) return "Врач";
    // Гарантируем, что есть пробел после слова "Врач"
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

  const handleAppointmentClick = (doctor?: ArchimedDoctor) => {
    setAppointmentModal({
      isOpen: true,
      doctor,
    });
  };

  const handleAppointmentSuccess = () => {
    // Можно добавить уведомление об успешной записи
    console.log("Appointment created successfully");
  };

  // Instant skeleton to make page feel snappy
  if (isLoading && doctors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark mb-3 sm:mb-4">
              Наши специалисты
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              Высококвалифицированные врачи клиники Алдан с многолетним опытом
              работы.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-28 sm:h-36 bg-gray-200" />
                <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 sm:h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorComponent
        title="Ошибка загрузки врачей"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark mb-3 sm:mb-4">
            Наши специалисты
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Высококвалифицированные врачи клиники Алдан с многолетним опытом
            работы.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="block text-gray-700 mb-1 sm:mb-2 font-medium text-sm sm:text-base"
              >
                Поиск врача
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Введите ФИО, специальность или отделение..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 pl-8 sm:pl-10 border border-gray-300 rounded focus:outline-none focus:border-primary text-sm sm:text-base"
                />
                <svg
                  className="absolute left-2 sm:left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label
                htmlFor="branch"
                className="block text-gray-700 mb-1 sm:mb-2 font-medium text-sm sm:text-base"
              >
                Отделение
              </label>
              <select
                id="branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary text-sm sm:text-base"
              >
                <option value="all">Все отделения</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-gray-700 mb-1 sm:mb-2 font-medium text-sm sm:text-base"
              >
                Категория
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary text-sm sm:text-base"
              >
                <option value="all">Все категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4"
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
              <h3 className="text-base sm:text-lg font-semibold text-dark mb-2">
                Врачи не найдены
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-5">
              {paginatedDoctors?.map((doctor: ArchimedDoctor) => (
                <div
                  key={`doctor-${doctor.id}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full"
                >
                  <div className="h-28 sm:h-44 bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center">
                    {doctor.photo ? (
                      <>
                        <img
                          src={
                            doctor.photo.startsWith("data:")
                              ? doctor.photo
                              : doctor.photo
                          }
                          alt={getDoctorFullName(doctor)}
                          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover object-[50%_30%] border-3 sm:border-4 border-white"
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
                          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
                          style={{ display: "none" }}
                        >
                          <svg
                            className="w-8 h-8 sm:w-12 sm:h-12 text-white"
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
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 sm:w-12 sm:h-12 text-white"
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
                    )}
                  </div>

                  <div className="p-3 sm:p-5 flex flex-col flex-grow">
                    <h3 className="text-base sm:text-lg font-semibold text-dark mb-1.5">
                      {getDoctorFullName(doctor)}
                    </h3>
                    <p className="text-primary font-medium mb-2 text-xs sm:text-sm">
                      Направление: {normalize(doctor.type)}
                    </p>

                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 flex-grow">
                      {doctor.branch && !/алдан/i.test(doctor.branch || "") && (
                        <div className="flex items-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
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
                      {doctor.category &&
                        /категор/i.test(doctor.category) &&
                        !/отсутств/i.test(doctor.category) && (
                          <div className="flex items-center">
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="leading-relaxed">
                              Квалификационная категория: {doctor.category}
                            </span>
                          </div>
                        )}
                      {(() => {
                        const years = getExperienceYears(doctor);
                        if (!years && years !== 0) return null;
                        return (
                          <div className="flex items-center">
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
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
                      {doctor.scientific_degree &&
                        doctor.scientific_degree !== "Без степени" && (
                          <div className="flex items-center">
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            <span className="leading-relaxed">
                              Ученая степень: {doctor.scientific_degree}
                            </span>
                          </div>
                        )}
                      <div className="flex items-center">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
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
                      {doctorServicesCount[doctor.id] && (
                        <div className="flex items-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0l-8 5-8-5"
                            />
                          </svg>
                          <span className="leading-relaxed">
                            Услуг: {doctorServicesCount[doctor.id]}
                          </span>
                        </div>
                      )}
                    </div>

                    {doctor.info && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 leading-relaxed line-clamp-2">
                        {doctor.info}
                      </p>
                    )}

                    <div className="flex flex-col space-y-1.5 sm:flex-row sm:space-y-0 sm:space-x-2 mt-auto">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors text-xs sm:text-sm text-center"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredDoctors.length > pageSize && (
          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3">
            <button
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded text-sm sm:text-base disabled:opacity-50"
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Назад
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
              {Array.from({ length: totalPages })
                .slice(0, 7)
                .map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={`page-${page}`}
                      className={`min-w-8 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-sm sm:text-base ${page === currentPage ? "bg-primary text-white" : "border border-gray-300"}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              {totalPages > 7 && (
                <span className="px-1 sm:px-2 text-gray-500">…</span>
              )}
              {totalPages > 7 && (
                <button
                  className={`min-w-8 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-sm sm:text-base ${totalPages === currentPage ? "bg-primary text-white" : "border border-gray-300"}`}
                  onClick={() => goToPage(totalPages)}
                >
                  {totalPages}
                </button>
              )}
            </div>
            <button
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded text-sm sm:text-base disabled:opacity-50"
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Вперёд
            </button>
          </div>
        )}

        {/* Модальное окно записи на прием */}
        <AppointmentModal
          isOpen={appointmentModal.isOpen}
          onClose={() => setAppointmentModal({ isOpen: false })}
          service={appointmentModal.service}
          doctor={appointmentModal.doctor}
          onSuccess={handleAppointmentSuccess}
        />
      </div>
    </div>
  );
}
