import doctorsDataRaw from "../data/doctors.json";
import { mockBranches, mockDoctors } from "../data/mockDoctors";
import { mockServices } from "../data/mockServices";
import prodoctorovDataRaw from "../data/prodoctorov.json";
import type {
  ApiService,
  AppointmentData,
  AppointmentStatus,
  ArchimedAppointment,
  ArchimedBranch,
  ArchimedCategory,
  ArchimedDoctor,
  ArchimedScientificDegree,
  ArchimedZone,
  GroupServiceInfo,
  GroupServicesResponse,
} from "../types/cms";
import { IndexedDBCache, indexedDBCache } from "./indexedDBCache";

// Archimed API: в dev и prod идём через тот же origin (Next.js rewrite / nginx),
// чтобы не было CORS. Поддерживаем оба префикса переменных (VITE_* из старых
// env-файлов и NEXT_PUBLIC_* для Next.js) — next.config.mjs проксирует их в клиент.
const ARCHIMED_API_URL =
  process.env.NEXT_PUBLIC_ARCHIMED_API_URL ||
  process.env.VITE_ARCHIMED_API_URL ||
  "/api/archimed";
const ARCHIMED_API_TOKEN = ""; // Token handled by backend

console.log("Environment variables:");
console.log("NEXT_PUBLIC_ARCHIMED_API_URL:", process.env.NEXT_PUBLIC_ARCHIMED_API_URL);
console.log("VITE_ARCHIMED_API_URL:", process.env.VITE_ARCHIMED_API_URL);
console.log("Final ARCHIMED_API_URL:", ARCHIMED_API_URL);
// Some deployments don't have categories endpoint – disable to avoid 404 requests
const ARCHIMED_CATEGORIES_ENABLED = false;

// Local cache settings.
// TTL — это время, в течение которого данные считаются свежими и не запрашиваются
// повторно. После него список обновляется из Archimed (см. getDoctors/getServices).
const DOCTORS_CACHE_KEY = "archimed_doctors_v6";
const SERVICES_CACHE_KEY = "archimed_services_v3";
const DOCTORS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут
const SERVICES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут
const MAX_CACHE_AGE_MS = 30 * 24 * 60 * 60 * 1000; // храним данные не дольше 30 дней
const DEFAULT_REQUEST_TIMEOUT_MS = 45000; // 45s: выгрузка врачей с фото бывает медленной

// Old cache keys to clean up
const OLD_DOCTORS_CACHE_KEYS = [
  "archimed_doctors_v2",
  "archimed_doctors_v3",
  "archimed_doctors_v4",
  "archimed_doctors_v5_no_cache",
];
const OLD_SERVICES_CACHE_KEYS = [
  "archimed_services_v1",
  "archimed_services_v2",
]; // Clean up old caches after switching to v3
const DEFAULT_API_PAGE_LIMIT = 500; // Increased page size to reduce number of requests
const MAX_API_PAGES = 50; // hard cap to prevent runaway loops
const PARALLEL_PAGES = 10; // Increased parallel batches for faster loading

// Archimed помечает услуги, которые не должны отображаться на сайте.
// Если поле отсутствует (старый бэкенд) — считаем услугу видимой.
const isServiceVisible = (service: ApiService) =>
  service.price_web_visible !== false;

// Helpers for name normalization and blacklist
const normalizeRu = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .trim();

const makeFullName = (d: ArchimedDoctor) =>
  normalizeRu([d?.name, d?.name1, d?.name2].filter(Boolean).join(" "));

// Names to exclude from all doctors lists and details.
// Важно: храним уже нормализованные имена, иначе чёрный список не срабатывает
// на дефисы/ё и т.п. (раньше из-за этого «скрытые» врачи оставались на сайте).
const NAME_BLACKLIST = new Set<string>(
  [
    "хорбаа анжела тарасовна",
    "торуш шораана дамдынчаповна",
    "монгуш чаяна алексеевна",
    "байтингер андрей владимирович",
    "щевелева галина викторовна",
    "бегзи сай суу олеговна",
    "лопсан айсу орлановна",
    "сафин динар адхамович",
    "арбаев аржан ильич",
    "дажынай мария владимировна",
    "администратор archimed",
  ].map(normalizeRu),
);

// Сотрудники без врачебной специальности не должны попадать в раздел «Врачи».
const NON_DOCTOR_TYPE_PATTERN =
  /(администратор|регистратор|рентгенолаборант|лаборант|медсестр|медицинск\w*\s+сестр|санитар|водител|бухгалтер|экономист|юрист|кадровик|инженер|программист|техник)/i;

type DoctorsListener = (doctors: ArchimedDoctor[]) => void;
type ServicesListener = (services: ApiService[]) => void;

class ArchimedService {
  private baseUrl: string;
  private headers: HeadersInit;
  private servicesCache: ApiService[] = [];
  private servicesCacheAt = 0;
  private doctorsCache: ArchimedDoctor[] = [];
  private doctorsCacheAt = 0;
  private servicesFetchPromise: Promise<ApiService[]> | null = null; // Deduplicate concurrent fetches
  private doctorsFetchPromise: Promise<ArchimedDoctor[]> | null = null;
  private indexedDBAvailable = false;
  private doctorsListeners = new Set<DoctorsListener>();
  private servicesListeners = new Set<ServicesListener>();

  constructor() {
    this.baseUrl = ARCHIMED_API_URL;
    this.headers = {
      "Content-Type": "application/json",
      ...(ARCHIMED_API_TOKEN
        ? { Authorization: `Bearer ${ARCHIMED_API_TOKEN}` }
        : {}),
    };

    console.log("ArchimedService constructor, API URL:", this.baseUrl);
    console.log("API Token configured:", !!ARCHIMED_API_TOKEN);

    // Check IndexedDB availability
    this.indexedDBAvailable = IndexedDBCache.isAvailable();
    console.log("IndexedDB available:", this.indexedDBAvailable);

    // Clean up only legacy cache keys. Current keys (v6/v3) не трогаем,
    // иначе кэш будет очищаться при каждой загрузке страницы.
    try {
      if (typeof window !== "undefined") {
        OLD_DOCTORS_CACHE_KEYS.forEach((key) => {
          try {
            window.localStorage?.removeItem(key);
          } catch {}
        });
        OLD_SERVICES_CACHE_KEYS.forEach((key) => {
          try {
            window.localStorage?.removeItem(key);
          } catch {}
        });
      }

      if (this.indexedDBAvailable) {
        OLD_SERVICES_CACHE_KEYS.forEach((key) => {
          indexedDBCache.remove(key).catch(() => {});
        });
      }
    } catch (error) {
      console.log("Cache cleanup error:", error);
    }
  }

  /** Подписка на обновление списка врачей из Archimed. */
  subscribeDoctors(listener: DoctorsListener): () => void {
    this.doctorsListeners.add(listener);
    return () => {
      this.doctorsListeners.delete(listener);
    };
  }

  /** Подписка на обновление прайса из Archimed. */
  subscribeServices(listener: ServicesListener): () => void {
    this.servicesListeners.add(listener);
    return () => {
      this.servicesListeners.delete(listener);
    };
  }

  private emitDoctors(): void {
    const list = this.doctorsCache;
    this.doctorsListeners.forEach((listener) => {
      try {
        listener(list);
      } catch (error) {
        console.warn("Doctors listener error:", error);
      }
    });
  }

  private emitServices(): void {
    const list = this.servicesCache;
    this.servicesListeners.forEach((listener) => {
      try {
        listener(list);
      } catch (error) {
        console.warn("Services listener error:", error);
      }
    });
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit & { timeoutMs?: number; suppressErrorLog?: boolean },
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("ARCHIMED_API_URL not configured");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort("timeout"),
      options?.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
    );

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          ...this.headers,
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate", // Request compression
        },
        // /api/archimed/talons теперь защищён сессией — cookie должна уходить с запросом.
        credentials: "include",
        signal: controller.signal,
        ...options,
      });
    } catch (e) {
      window.clearTimeout(timeout);
      if ((e as Error)?.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw e;
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (!options?.suppressErrorLog) {
        console.error("API error response:", errorText);
      }

      // Check if response is HTML instead of JSON (backend not running)
      if (
        errorText.trim().startsWith("<!DOCTYPE") ||
        errorText.trim().startsWith("<html")
      ) {
        throw new Error(
          "Backend server is not running. Please start the backend server.",
        );
      }

      throw new Error(`Archimed API error: ${response.status} - ${errorText}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      const text = await response.text();
      if (
        text.trim().startsWith("<!DOCTYPE") ||
        text.trim().startsWith("<html")
      ) {
        throw new Error(
          "Backend server returned HTML instead of JSON. Is the backend running?",
        );
      }
    }

    return response.json();
  }

  private readFromStorageWithAge<T>(
    key: string,
  ): { data: T; timestamp: number } | null {
    try {
      if (typeof window === "undefined") return null;
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { data: T; timestamp: number };
      if (!parsed || !parsed.data || !parsed.timestamp) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private writeToStorage<T>(key: string, data: T): void {
    try {
      if (typeof window === "undefined") return;
      const payload = JSON.stringify({ data, timestamp: Date.now() });
      window.localStorage.setItem(key, payload);
    } catch {
      // ignore storage errors (quota exceeded и т.п.)
    }
  }

  private async readCachedDoctors(): Promise<{
    data: ArchimedDoctor[];
    timestamp: number;
  } | null> {
    if (this.indexedDBAvailable) {
      const entry = await indexedDBCache.getEntry<ArchimedDoctor[]>(
        DOCTORS_CACHE_KEY,
      );
      if (entry?.data?.length) {
        return {
          data: entry.data,
          timestamp: entry.timestamp,
        };
      }
    }
    return this.readFromStorageWithAge<ArchimedDoctor[]>(DOCTORS_CACHE_KEY);
  }

  private async persistDoctors(list: ArchimedDoctor[]): Promise<void> {
    if (this.indexedDBAvailable) {
      await indexedDBCache.set(DOCTORS_CACHE_KEY, list, MAX_CACHE_AGE_MS);
    }
    this.writeToStorage(DOCTORS_CACHE_KEY, list);
  }

  /**
   * Врачи из Archimed.
   *
   * Стратегия stale-while-revalidate:
   * 1. Если есть свежий кэш — отдаём его сразу.
   * 2. Если кэш устарел (или его нет) — показываем сохранённый снимок,
   *    а данные из Archimed подтягиваем в фоне и сообщаем подписчикам.
   *
   * Так изменения из Archimed приходят без ожидания 10+ секунд
   * на выгрузку фото, но и страница не показывает пустой список.
   */
  async getDoctors(): Promise<ArchimedDoctor[]> {
    const now = Date.now();

    // 1. Память
    if (this.doctorsCache.length > 0) {
      if (now - this.doctorsCacheAt >= DOCTORS_CACHE_TTL_MS) {
        this.refreshDoctorsInBackground();
      }
      return this.doctorsCache;
    }

    // 2. IndexedDB / localStorage
    const cached = await this.readCachedDoctors();
    if (cached?.data?.length) {
      const list = this.applyRemovals(cached.data);
      this.doctorsCache = list;
      this.doctorsCacheAt = cached.timestamp;
      if (now - cached.timestamp >= DOCTORS_CACHE_TTL_MS) {
        this.refreshDoctorsInBackground();
      }
      return list;
    }

    // 3. Первый визит: локальный снимок для мгновенного отображения,
    //    актуальные данные — сразу в фоне.
    const local = await this.loadLocalDoctorsSnapshot();
    this.doctorsCache = local;
    this.doctorsCacheAt = 0;
    this.refreshDoctorsInBackground();
    return local;
  }

  async refreshDoctorsIfNeeded(): Promise<void> {
    if (Date.now() - this.doctorsCacheAt >= DOCTORS_CACHE_TTL_MS) {
      await this.refreshDoctors().catch(() => {});
    }
  }

  /**
   * Принудительное обновление справочника врачей из Archimed.
   * Используется админкой: игнорирует TTL и очищает IndexedDB/localStorage,
   * чтобы правки в Архимеде появились на сайте сразу.
   */
  async refreshDoctorsNow(): Promise<ArchimedDoctor[]> {
    this.doctorsCache = [];
    this.doctorsCacheAt = 0;
    try {
      if (this.indexedDBAvailable) {
        await indexedDBCache.remove(DOCTORS_CACHE_KEY);
      }
      if (typeof window !== "undefined") {
        window.localStorage?.removeItem(DOCTORS_CACHE_KEY);
      }
    } catch (error) {
      console.warn("Не удалось очистить кэш врачей:", error);
    }
    return this.refreshDoctors();
  }

  /**
   * Явная ревалидация для публичных страниц (/doctors, /prices).
   * Не очищает кэш и не блокирует рендер: если Archimed ответил, подписчики
   * (страницы) получают свежие данные через emitDoctors/emitServices.
   */
  revalidateDoctors(): void {
    this.refreshDoctorsInBackground();
  }

  private refreshDoctorsInBackground(): void {
    void this.refreshDoctors().catch((error) => {
      console.warn("Не удалось обновить врачей из Archimed:", error);
      // Не долбим API на каждом запросе, если он недоступен:
      // следующие 5 минут показываем кэш/локальный снимок.
      this.doctorsCacheAt = Date.now();
    });
  }

  private async refreshDoctors(): Promise<ArchimedDoctor[]> {
    // Не запускаем параллельные одинаковые запросы.
    if (this.doctorsFetchPromise) return this.doctorsFetchPromise;

    this.doctorsFetchPromise = (async () => {
      const apiDoctors = await this.fetchAllDoctorsFromAPI();
      if (!Array.isArray(apiDoctors) || apiDoctors.length === 0) {
        throw new Error("Archimed API returned no doctors");
      }

      let doctors = apiDoctors;
      const proDocs = await this.loadProdoctorovSnapshotStatic();
      if (proDocs.length > 0) {
        // ProDoctorov только дополняет карточки (фото, стаж, категория),
        // но не добавляет врачей, которых нет в Archimed.
        doctors = this.mergeDoctors(doctors, proDocs, false);
      }

      doctors = this.applyRemovals(doctors);
      if (doctors.length === 0) {
        throw new Error("No visible doctors after filtering");
      }

      this.doctorsCache = doctors;
      this.doctorsCacheAt = Date.now();
      await this.persistDoctors(doctors);
      this.emitDoctors();
      console.log("Doctors updated from Archimed:", doctors.length);
      return doctors;
    })().finally(() => {
      this.doctorsFetchPromise = null;
    });

    return this.doctorsFetchPromise;
  }

  private async loadLocalDoctorsSnapshot(): Promise<ArchimedDoctor[]> {
    try {
      const raw = doctorsDataRaw as any;
      let localDoctors: ArchimedDoctor[] = Array.isArray(raw)
        ? (raw as ArchimedDoctor[])
        : Array.isArray(raw?.data)
          ? (raw.data as ArchimedDoctor[])
          : [];

      const proDocs = await this.loadProdoctorovSnapshotStatic();
      if (proDocs.length > 0) {
        // Если снимок совсем маленький/устаревший — разрешаем дополнить его
        // врачами из ProDoctorov. Для полного снимка только обогащаем карточки.
        localDoctors = this.mergeDoctors(
          localDoctors,
          proDocs,
          localDoctors.length < 10,
        );
      }

      return this.applyRemovals(localDoctors);
    } catch (error) {
      console.warn(
        "Не удалось загрузить снимок врачей, используем mockDoctors:",
        error,
      );
      let fallback = this.mergeDoctors(
        mockDoctors,
        await this.loadProdoctorovSnapshotStatic(),
      );
      fallback = this.applyRemovals(fallback);
      return fallback;
    }
  }

  async getDoctor(id: number): Promise<ArchimedDoctor> {
    const doc = await this.request<ArchimedDoctor>(`/doctors/${id}`);
    if (this.isHiddenDoctor(doc)) {
      throw new Error("Archimed API error: 404 - Not found");
    }
    return doc;
  }

  async getDoctorsByBranch(branchId: number): Promise<ArchimedDoctor[]> {
    const data = await this.request<{ data: ArchimedDoctor[] }>(
      `/doctors?branch_id=${branchId}`,
    );
    return data.data;
  }

  async getDoctorsByType(typeId: number): Promise<ArchimedDoctor[]> {
    const data = await this.request<{ data: ArchimedDoctor[] }>(
      `/doctors?type_id=${typeId}`,
    );
    return data.data;
  }

  /**
   * Прайс из Archimed.
   *
   * Если кэш свежий (младше 5 минут) — отдаём его. Если устарел — сначала
   * обновляем данные из Archimed и только потом отдаём (при ошибке
   * показываем устаревший кэш). Так изменения цен и состава услуг
   * появляются на сайте без ручной очистки кэша.
   */
  async getServices(): Promise<ApiService[]> {
    const now = Date.now();

    // 1. Память
    if (this.servicesCache.length > 0) {
      if (now - this.servicesCacheAt < SERVICES_CACHE_TTL_MS) {
        return this.servicesCache;
      }
      try {
        return await this.refreshServices();
      } catch {
        return this.servicesCache;
      }
    }

    // 2. IndexedDB
    if (this.indexedDBAvailable) {
      const entry =
        await indexedDBCache.getEntry<ApiService[]>(SERVICES_CACHE_KEY);
      if (entry?.data?.length) {
        this.servicesCache = entry.data;
        this.servicesCacheAt = entry.timestamp;
        if (now - entry.timestamp < SERVICES_CACHE_TTL_MS) {
          console.log("Loaded services from IndexedDB:", entry.data.length);
          return entry.data;
        }
        try {
          return await this.refreshServices();
        } catch {
          return this.servicesCache;
        }
      }
    }

    // 3. localStorage
    const stored =
      this.readFromStorageWithAge<ApiService[]>(SERVICES_CACHE_KEY);
    if (stored?.data?.length) {
      this.servicesCache = stored.data;
      this.servicesCacheAt = stored.timestamp;
      if (now - stored.timestamp < SERVICES_CACHE_TTL_MS) {
        console.log("Loaded services from localStorage:", stored.data.length);
        return stored.data;
      }
      try {
        return await this.refreshServices();
      } catch {
        return this.servicesCache;
      }
    }

    // 4. Кэша нет — грузим из API. Моковые данные не сохраняем в кэш,
    //    чтобы при следующем запросе снова попробовать Archimed.
    try {
      return await this.refreshServices();
    } catch (error) {
      console.warn(
        "API недоступен, используем моковые данные для услуг:",
        error,
      );
      return this.servicesCache.length > 0 ? this.servicesCache : mockServices;
    }
  }

  /**
   * Принудительное обновление прайса из Archimed (без кэша).
   */
  async refreshServicesNow(): Promise<ApiService[]> {
    this.servicesCache = [];
    this.servicesCacheAt = 0;
    try {
      if (this.indexedDBAvailable) {
        await indexedDBCache.remove(SERVICES_CACHE_KEY);
      }
      if (typeof window !== "undefined") {
        window.localStorage?.removeItem(SERVICES_CACHE_KEY);
      }
    } catch (error) {
      console.warn("Не удалось очистить кэш услуг:", error);
    }
    return this.refreshServices();
  }

  /** Явная ревалидация прайса при открытии /prices или возврате во вкладку. */
  revalidateServices(): void {
    this.refreshServicesInBackground();
  }

  private refreshServicesInBackground(): void {
    void this.refreshServices().catch((error) => {
      console.warn("Не удалось обновить услуги из Archimed:", error);
      // При ошибке не дёргаем API на каждом рендере в течение TTL.
      this.servicesCacheAt = Date.now();
    });
  }

  /** Обновить и врачей, и услуги одной кнопкой в админке. */
  async refreshAllNow(): Promise<{ doctors: number; services: number }> {
    const [doctors, services] = await Promise.all([
      this.refreshDoctorsNow(),
      this.refreshServicesNow(),
    ]);
    return { doctors: doctors.length, services: services.length };
  }

  private async persistServices(list: ApiService[]): Promise<void> {
    if (this.indexedDBAvailable) {
      await indexedDBCache.set(SERVICES_CACHE_KEY, list, MAX_CACHE_AGE_MS);
    }
    this.writeToStorage(SERVICES_CACHE_KEY, list);
  }

  private async fetchAllServicesFromAPI(
    onProgress?: (
      loaded: number,
      total: number,
      partialData: ApiService[],
    ) => void,
  ): Promise<ApiService[]> {
    // Бэкенд отдаёт прайс уже сгруппированным одним запросом (токен подставляется на сервере)
    try {
      const grouped = await this.request<{
        data: Array<{
          id: number;
          code?: string;
          name: string;
          parent_id?: number | null;
          parent_name?: string | null;
          services: ApiService[];
        }>;
        total: number;
        groups: number;
      }>("/services", { timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS });

      const all: ApiService[] = [];
      const isGroupedFormat =
        Array.isArray(grouped?.data) &&
        grouped.data.some(
          (g) => g !== null && typeof g === "object" && "services" in g,
        );
      // Плоский ответ старого бэкенда (услуги без поля services) — уходим в fallback-пагинацию
      if (isGroupedFormat) {
        for (const group of grouped.data) {
          for (const s of group.services || []) {
            if (!isServiceVisible(s)) continue;
            // Услуги из групп без group_name дополняем иерархией групп
            all.push({
              ...s,
              group_id: s.group_id ?? group.id,
              group_name:
                s.group_name ||
                [group.parent_name, group.name].filter(Boolean).join(" / "),
            });
          }
        }
        if (onProgress) onProgress(all.length, all.length, [...all]);
        return all;
      }
    } catch (e) {
      console.warn(
        "Grouped services endpoint failed, falling back to pagination:",
        e,
      );
    }

    const all: ApiService[] = [];

    // If base URL is not configured, short-circuit
    if (!this.baseUrl) {
      console.warn("ARCHIMED_API_URL not configured, cannot fetch services");
      return all;
    }

    // Fetch first page to get total count
    try {
      const first = await this.request<{
        data: ApiService[];
        total: number | string;
        page: number;
        limit: number;
      }>(`/services?page=1&limit=${DEFAULT_API_PAGE_LIMIT}`, {
        timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
      });

      // total может быть строкой или числом
      const total =
        typeof first.total === "string"
          ? Number.parseInt(first.total, 10)
          : (first.total ?? first.data?.length ?? 0);
      const limit = first.limit ?? DEFAULT_API_PAGE_LIMIT;

      if (Array.isArray(first?.data)) {
        all.push(...first.data.filter(isServiceVisible));
        // Report progress after first page (show data early!)
        if (onProgress) onProgress(all.length, total, [...all]);
      }

      const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
      const cappedTotalPages = Math.min(totalPages, MAX_API_PAGES);

      // Fetch remaining pages in parallel batches
      if (cappedTotalPages > 1) {
        const pagesToFetch: number[] = [];
        for (let p = 2; p <= cappedTotalPages; p++) {
          pagesToFetch.push(p);
        }

        // Process pages in parallel batches
        for (let i = 0; i < pagesToFetch.length; i += PARALLEL_PAGES) {
          const batch = pagesToFetch.slice(i, i + PARALLEL_PAGES);
          const results = await Promise.all(
            batch.map(async (page) => {
              try {
                const response = await this.request<{
                  data: ApiService[];
                  total: number | string;
                  page: number;
                  limit: number;
                }>(`/services?page=${page}&limit=${limit}`, {
                  timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
                });
                return response?.data || [];
              } catch (pageError) {
                console.warn(
                  `Error fetching services page ${page}:`,
                  pageError,
                );
                return [];
              }
            }),
          );

          // Merge results from this batch
          for (const pageData of results) {
            if (pageData.length > 0) {
              all.push(...pageData.filter(isServiceVisible));
            }
          }

          // Report progress after each batch (progressive loading)
          if (onProgress) onProgress(all.length, total, [...all]);

          // Check if we got a partial page (indicates last page)
          const lastBatchHadPartial = results.some((r) => r.length < limit);
          if (lastBatchHadPartial) {
            return all;
          }
        }
      }
    } catch (e) {
      console.warn("Error fetching services from API:", e);
      // Не пробрасываем ошибку, возвращаем то что успели получить (может быть пустой массив)
    }

    return all;
  }

  async getService(id: number): Promise<ApiService> {
    return this.request<ApiService>(`/services/${id}`);
  }

  async getServicesByGroup(groupId: number): Promise<ApiService[]> {
    try {
      const response = await this.request<{
        data: ApiService[];
        total: number;
        page: number;
        limit: number;
      }>(`/services?group_id=${groupId}`);
      return response.data || [];
    } catch (error) {
      console.warn(
        "API недоступен для услуг группы, возвращаем пустой массив:",
        error,
      );
      return [];
    }
  }

  // Zones
  async getZones(): Promise<ArchimedZone[]> {
    try {
      const response = await this.request<{
        data: ArchimedZone[];
        total: number;
        page: number;
        limit: number;
      }>("/zones");
      return response.data || [];
    } catch (error) {
      console.warn("API недоступен для зон, возвращаем пустой массив:", error);
      return [];
    }
  }

  // Branches
  async getBranches(): Promise<ArchimedBranch[]> {
    try {
      // Бэкенд (NestJS) отдаёт филиалы по /branches (в исходном Archimed API — "branchs").
      const response = await this.request<{
        data: ArchimedBranch[];
        total: number;
        page: number;
        limit: number;
      }>("/branches");
      return response.data || [];
    } catch (error) {
      console.warn(
        "API недоступен, используем моковые данные для филиалов:",
        error,
      );
      return mockBranches;
    }
  }

  // Categories
  async getCategories(): Promise<ArchimedCategory[]> {
    if (!ARCHIMED_CATEGORIES_ENABLED) {
      return [] as ArchimedCategory[];
    }
    try {
      const response = await this.request<{
        data: ArchimedCategory[];
        total: number;
        page: number;
        limit: number;
      }>("/categories", { suppressErrorLog: true });
      return response.data || [];
    } catch {
      return [] as ArchimedCategory[];
    }
  }

  // Scientific Degrees
  async getScientificDegrees(): Promise<ArchimedScientificDegree[]> {
    try {
      const response = await this.request<{
        data: ArchimedScientificDegree[];
        total: number;
        page: number;
        limit: number;
      }>("/scientific_degrees");
      return response.data || [];
    } catch (error) {
      console.warn(
        "API недоступен для научных степеней, возвращаем пустой массив:",
        error,
      );
      return [];
    }
  }

  // Cache helpers
  getServicesCache(): ApiService[] {
    return this.servicesCache;
  }

  getDoctorsCache(): ArchimedDoctor[] {
    return this.doctorsCache;
  }

  private async fetchAllDoctorsFromAPI(): Promise<ArchimedDoctor[]> {
    const all: ArchimedDoctor[] = [];
    let page = 1;

    // If base URL is not configured, short-circuit
    if (!this.baseUrl) return all;

    // Try to fetch a large single page first
    try {
      const first = await this.request<{
        data: ArchimedDoctor[];
        total: number;
        page: number;
        limit: number;
      }>(`/doctors?page=${page}&limit=${DEFAULT_API_PAGE_LIMIT}`, {
        timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
      });
      const total = (first as any)?.total ?? first?.data?.length ?? 0;
      const limit = (first as any)?.limit ?? DEFAULT_API_PAGE_LIMIT;
      if (Array.isArray(first?.data)) {
        all.push(...first.data);
      }
      const totalPages =
        limit > 0 ? Math.ceil((total || all.length) / limit) : 1;

      // Fetch remaining pages if needed
      for (page = 2; page <= Math.min(totalPages, MAX_API_PAGES); page++) {
        const next = await this.request<{
          data: ArchimedDoctor[];
          total: number;
          page: number;
          limit: number;
        }>(`/doctors?page=${page}&limit=${limit}`, {
          timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
        });
        if (Array.isArray(next?.data) && next.data.length > 0) {
          all.push(...next.data);
          if (next.data.length < limit) break; // last page
        } else {
          break;
        }
      }
    } catch (e) {
      console.warn("Error fetching all doctors from API:", e);
    }

    // Archimed иногда отдаёт одну и ту же карточку на границе страниц.
    const seen = new Set<number>();
    return all.filter((doctor) => {
      if (seen.has(doctor.id)) return false;
      seen.add(doctor.id);
      return true;
    });
  }

  // Load and map ProDoctorov snapshot if present - using static import for faster loading
  private async loadProdoctorovSnapshotStatic(): Promise<ArchimedDoctor[]> {
    try {
      const raw = prodoctorovDataRaw as any;
      const list: Array<{
        fullName: string;
        specialty: string;
        photo?: string;
        category?: string;
        scientific_degree?: string;
        experienceStartYear?: number;
        extraSpecialties?: string[];
      }> = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      if (!Array.isArray(list) || list.length === 0) return [];
      const mapped: ArchimedDoctor[] = list.map((item, idx) =>
        this.mapProdoctorovToArchimed(item, idx),
      );
      return mapped;
    } catch {
      return [];
    }
  }

  private mapProdoctorovToArchimed(
    item: {
      fullName: string;
      specialty: string;
      photo?: string;
      category?: string;
      scientific_degree?: string;
      experienceStartYear?: number;
      extraSpecialties?: string[];
    },
    index: number,
  ): ArchimedDoctor {
    const [lastName = "", firstName = "", middleName = ""] =
      item.fullName.split(/\s+/);
    const typeName = item.specialty || "Врач";
    const id = 100000 + index; // avoid id collisions
    const defaultBranch = "Клиника Алдан";
    const defaultCategory = item.category || typeName;
    const degree = item.scientific_degree || "Без степени";
    const extraTypes = Array.isArray(item.extraSpecialties)
      ? item.extraSpecialties
      : [];
    const experienceInfo = item.experienceStartYear
      ? `Врачебный стаж с ${item.experienceStartYear} г.`
      : "";
    const extraInfo =
      extraTypes.length > 0
        ? `Смежные специальности: ${extraTypes.join(", ")}`
        : "";
    const info = [experienceInfo, extraInfo].filter(Boolean).join("\n");
    // Кужугет Росси - 20 минут, остальные - 30 минут
    const isKuzhuget =
      lastName.toLowerCase() === "кужугет" &&
      firstName.toLowerCase() === "росси";
    return {
      id,
      name: lastName,
      name1: firstName,
      name2: middleName,
      type: typeName,
      code: "",
      max_time: isKuzhuget ? "20" : "30",
      phone: "",
      snils: "",
      info,
      zone_id: 0,
      zone: "",
      branch_id: 0,
      branch: defaultBranch,
      category_id: 0,
      category: defaultCategory,
      scientific_degree_id: 0,
      scientific_degree: degree,
      user_id: 0,
      photo: item.photo || null,
      address: "г. Кызыл, ул. Ленина, 60",
      building_name: "Поликлиника №1",
      building_web_name: "Поликлиника №1",
      primary_type_id: 0,
      types: [
        { id: 0, name: typeName },
        ...extraTypes.map((n, i) => ({ id: i + 1, name: n })),
      ],
      experienceStartYear: item.experienceStartYear,
    };
  }

  private mergeDoctors(
    primary: ArchimedDoctor[],
    extra: ArchimedDoctor[],
    addMissing = true,
  ): ArchimedDoctor[] {
    const normalize = (s: string) =>
      (s || "").toLowerCase().replace(/ё/g, "е").trim();
    const makeNameKey = (d: ArchimedDoctor) =>
      `${normalize(d.name)}|${normalize(d.name1)}|${normalize(d.name2)}`;

    const byName = new Map<string, ArchimedDoctor>();
    for (const d of primary) byName.set(makeNameKey(d), d);

    const mergeOne = (
      base: ArchimedDoctor,
      add: ArchimedDoctor,
    ): ArchimedDoctor => {
      const isEmpty = (v: unknown) =>
        v === undefined ||
        v === null ||
        (typeof v === "string" && v.trim() === "");

      const merged: ArchimedDoctor = { ...base };

      // Photo
      if ((!base.photo || base.photo === "") && add.photo)
        merged.photo = add.photo;

      // Scientific degree
      const baseDeg = normalize(base.scientific_degree || "");
      const addDeg = normalize(add.scientific_degree || "");
      if (
        (isEmpty(base.scientific_degree) || baseDeg === "без степени") &&
        addDeg &&
        addDeg !== "без степени"
      ) {
        merged.scientific_degree = add.scientific_degree;
      }

      // Experience start year: prefer explicit year from prodoctorov data
      if (!base.experienceStartYear && add.experienceStartYear) {
        merged.experienceStartYear = add.experienceStartYear;
      }

      // Category: prefer explicit categories like "Высшая категория", "Первая категория", etc.
      const looksLikeCategory = (s: string) => /(категор)/i.test(s);
      if (
        (isEmpty(base.category) || !looksLikeCategory(base.category)) &&
        looksLikeCategory(add.category)
      ) {
        merged.category = add.category;
      }

      // Info: append experience and extras if missing
      const infoText = base.info || "";
      const addInfo = add.info || "";
      const hasExperience =
        /стаж\s+с\s+\d{4}/i.test(infoText) ||
        /врачебный\s+стаж\s+с\s+\d{4}/i.test(infoText);
      const addHasExperience =
        /стаж\s+с\s+\d{4}/i.test(addInfo) ||
        /врачебный\s+стаж\s+с\s+\d{4}/i.test(addInfo);
      const parts: string[] = [];
      if (infoText) parts.push(infoText);
      if (!hasExperience && addHasExperience)
        parts.push(addInfo.split(/\n+/)[0]);
      // Include extra specialties line if present in add.info and not already present
      const addExtrasLine = addInfo
        .split(/\n+/)
        .find((l) => /Смежные специальности/i.test(l));
      if (addExtrasLine && !/Смежные специальности/i.test(infoText))
        parts.push(addExtrasLine);
      merged.info = parts.filter(Boolean).join("\n");

      // Types: merge unique type names
      const baseTypeNames = new Set<string>([
        normalize(base.type),
        ...(base.types || []).map((t) => normalize(t.name)),
      ]);
      const addTypeNames = new Set<string>([
        normalize(add.type),
        ...(add.types || []).map((t) => normalize(t.name)),
      ]);
      const mergedTypeNames = new Set<string>([...baseTypeNames]);
      for (const n of addTypeNames)
        if (n && !mergedTypeNames.has(n)) mergedTypeNames.add(n);
      const materialized = Array.from(mergedTypeNames)
        .filter(Boolean)
        .map(
          (name, idx) => ({ id: idx, name }) as ArchimedDoctor["types"][number],
        ) as ArchimedDoctor["types"];
      if (materialized.length > 0) {
        merged.types = materialized.map((t, i) => ({ id: i, name: t.name }));
        // Keep primary type as the first humanized type name
        const first = materialized[0]?.name || base.type;
        if (first) merged.type = first;
      }

      return merged;
    };

    for (const add of extra) {
      const key = makeNameKey(add);
      const existing = byName.get(key);
      if (existing) {
        byName.set(key, mergeOne(existing, add));
      } else if (addMissing) {
        byName.set(key, add);
      }
    }

    return Array.from(byName.values());
  }

  private isBlacklisted(doctor: ArchimedDoctor): boolean {
    try {
      const full = makeFullName(doctor);
      if (!full) return true;
      if (/администратор|тестов/i.test(full)) return true;
      return NAME_BLACKLIST.has(full);
    } catch {
      return false;
    }
  }

  private isHiddenDoctor(doctor: ArchimedDoctor): boolean {
    if (this.isBlacklisted(doctor)) return true;
    const types = [
      doctor?.type,
      ...(doctor?.types || []).map((type) => type?.name),
    ]
      .filter(Boolean)
      .join(" ");
    return NON_DOCTOR_TYPE_PATTERN.test(types);
  }

  private applyRemovals(list: ArchimedDoctor[]): ArchimedDoctor[] {
    try {
      return (Array.isArray(list) ? list : []).filter(
        (d) => !this.isHiddenDoctor(d),
      );
    } catch {
      return Array.isArray(list) ? list : [];
    }
  }

  // Public helpers to link services with doctors
  async getDoctorsWithServices(): Promise<
    Array<ArchimedDoctor & { services?: ApiService[] }>
  > {
    const [doctors, services] = await Promise.all([
      this.getDoctors(),
      this.getServices().catch(() => [] as ApiService[]),
    ]);
    const normalized = (s: string) =>
      (s || "").toLowerCase().replace(/ё/g, "е");
    const tokenize = (s: string) => normalized(s).split(/\s+/).filter(Boolean);
    const result = doctors.map((d) => {
      const docTokens = new Set<string>([
        ...tokenize(d.type),
        ...(d.types || []).flatMap((t) => tokenize(t.name)),
      ]);
      const matched = services.filter((svc) => {
        const svcTokens = new Set<string>([
          ...tokenize(svc.group_name),
          ...tokenize(svc.name),
        ]);
        for (const t of docTokens) if (svcTokens.has(t)) return true;
        return false;
      });
      return { ...d, services: matched };
    });
    return result;
  }

  async getServicesWithDoctors(): Promise<
    Array<ApiService & { doctors?: ArchimedDoctor[] }>
  > {
    const [doctors, services] = await Promise.all([
      this.getDoctors(),
      this.getServices().catch(() => [] as ApiService[]),
    ]);
    const normalized = (s: string) =>
      (s || "").toLowerCase().replace(/ё/g, "е");
    const tokenize = (s: string) => normalized(s).split(/\s+/).filter(Boolean);
    const svcWithDocs = services.map((svc) => {
      const svcTokens = new Set<string>([
        ...tokenize(svc.group_name),
        ...tokenize(svc.name),
      ]);
      const matched = doctors.filter((d) => {
        const docTokens = new Set<string>([
          ...tokenize(d.type),
          ...(d.types || []).flatMap((t) => tokenize(t.name)),
        ]);
        for (const t of docTokens) if (svcTokens.has(t)) return true;
        return false;
      });
      return { ...svc, doctors: matched };
    });
    return svcWithDocs;
  }

  private async refreshServices(): Promise<ApiService[]> {
    if (this.servicesFetchPromise) return this.servicesFetchPromise;

    this.servicesFetchPromise = (async () => {
      const allServices = await this.fetchAllServicesFromAPI();
      if (!Array.isArray(allServices) || allServices.length === 0) {
        throw new Error("Archimed API returned no services");
      }

      // На всякий случай убираем дубли по id (пагинация Archimed иногда
      // отдаёт одну и ту же услугу на границе страниц).
      const seen = new Set<number>();
      const unique = allServices.filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });

      this.servicesCache = unique;
      this.servicesCacheAt = Date.now();
      await this.persistServices(unique);
      this.emitServices();
      console.log("Services updated from Archimed:", unique.length);
      return unique;
    })().finally(() => {
      this.servicesFetchPromise = null;
    });

    return this.servicesFetchPromise;
  }

  // Appointments
  async createAppointment(
    appointmentData: AppointmentData,
  ): Promise<ArchimedAppointment> {
    // Если API токен не настроен, используем моковые данные для тестирования
    if (!ARCHIMED_API_TOKEN) {
      console.warn("API token not configured, using mock data for testing");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: Math.floor(Math.random() * 1000),
            patient_name: appointmentData.patientName,
            patient_phone: appointmentData.patientPhone,
            patient_email: appointmentData.patientEmail,
            preferred_date: appointmentData.preferredDate,
            preferred_time: appointmentData.preferredTime,
            comments: appointmentData.comments,
            service_id: appointmentData.serviceId,
            doctor_id: appointmentData.doctorId,
            status_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }, 1000);
      });
    }

    const payload = {
      patient_name: appointmentData.patientName,
      patient_phone: appointmentData.patientPhone,
      patient_email: appointmentData.patientEmail,
      preferred_date: appointmentData.preferredDate,
      preferred_time: appointmentData.preferredTime,
      comments: appointmentData.comments,
      service_id: appointmentData.serviceId,
      doctor_id: appointmentData.doctorId,
    };

    return this.request<ArchimedAppointment>("/talons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getAppointments(filters?: {
    doctorId?: number;
    serviceId?: number;
    statusId?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ArchimedAppointment[];
    total: number;
    page: number;
    limit: number;
  }> {
    // "Сырой" талон Archimed: поля отличаются от фронт-модели
    // (date dd.mm.yyyy, begintime, info вместо preferred_date/preferred_time/comments).
    type RawTalon = Partial<ArchimedAppointment> & {
      date?: string;
      begintime?: string;
      info?: string;
      room_id?: number;
      room?: string;
      /** Врач в талоне Archimed приходит в массиве docs, а не в doctor_id. */
      docs?: Array<{ id?: number; name?: string; type?: string }>;
      creation_datetime?: string;
      update_datetime?: string;
    };

    const toIsoDate = (d?: string): string | undefined => {
      if (!d) return undefined;
      const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      return m ? `${m[3]}-${m[2]}-${m[1]}` : d;
    };

    const mapTalon = (t: RawTalon): ArchimedAppointment => {
      const doc = Array.isArray(t.docs) ? t.docs[0] : undefined;
      return {
        ...t,
        id: t.id ?? 0,
        status_id: t.status_id ?? 0,
        patient_name: t.patient_name ?? "",
        patient_phone: t.patient_phone ?? "",
        preferred_date: t.preferred_date ?? toIsoDate(t.date),
        preferred_time: t.preferred_time ?? t.begintime?.slice(0, 5),
        comments: t.comments ?? t.info,
        // room_id — это кабинет, а не id врача. Врач лежит в docs[0].
        // Кабинет не подставляем как имя врача: это разные сущности.
        doctor_id: t.doctor_id ?? doc?.id,
        doctor_name: t.doctor_name ?? doc?.name ?? undefined,
        room_name: t.room_name ?? t.room ?? undefined,
        created_at: t.created_at ?? t.creation_datetime ?? "",
        updated_at: t.updated_at ?? t.update_datetime ?? "",
      };
    };

    try {
      const limit = filters?.limit ?? 100;
      const params = new URLSearchParams();
      if (filters?.doctorId)
        params.append("doctor_id", filters.doctorId.toString());
      if (filters?.serviceId)
        params.append("service_id", filters.serviceId.toString());
      if (filters?.statusId)
        params.append("status_id", filters.statusId.toString());
      params.append("limit", limit.toString());

      // Archimed API игнорирует фильтры и сортировку и отдаёт талоны по возрастанию id,
      // поэтому свежие записи — на последних страницах. Узнаём total из первого запроса
      // и тянем последние страницы (последние 2 — чтобы покрыть сегодня и завтра).
      params.set("page", "1");
      const first = await this.request<{
        data: RawTalon[];
        total: number | string;
        page: number;
        limit: number;
      }>(`/talons?${params.toString()}`, { suppressErrorLog: true });

      const total = Number.parseInt(String(first.total ?? "0"), 10) || 0;
      const lastPage = Math.max(1, Math.ceil(total / limit));

      let items: RawTalon[] = first.data ?? [];
      if (lastPage > 1) {
        const pages = [Math.max(1, lastPage - 1), lastPage];
        const fetched = await Promise.all(
          pages.map((p) => {
            params.set("page", String(p));
            return this.request<{ data: RawTalon[] }>(
              `/talons?${params.toString()}`,
              { suppressErrorLog: true },
            );
          }),
        );
        items = fetched.flatMap((r) => r.data ?? []);
      }

      return {
        data: items.map(mapTalon),
        total,
        page: lastPage,
        limit,
      };
    } catch (error) {
      console.warn("API недоступен для записей на прием:", error);
      return { data: [], total: 0, page: 1, limit: 100 };
    }
  }

  async getAppointment(id: number): Promise<ArchimedAppointment> {
    return this.request<ArchimedAppointment>(`/talons/${id}`);
  }

  async updateAppointment(
    id: number,
    appointmentData: Partial<AppointmentData>,
  ): Promise<ArchimedAppointment> {
    const payload = {
      patient_name: appointmentData.patientName,
      patient_phone: appointmentData.patientPhone,
      patient_email: appointmentData.patientEmail,
      preferred_date: appointmentData.preferredDate,
      preferred_time: appointmentData.preferredTime,
      comments: appointmentData.comments,
      service_id: appointmentData.serviceId,
      doctor_id: appointmentData.doctorId,
    };

    // Удаляем undefined значения
    Object.keys(payload).forEach(
      (key) =>
        payload[key as keyof typeof payload] === undefined &&
        delete payload[key as keyof typeof payload],
    );

    return this.request<ArchimedAppointment>(`/talons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteAppointment(id: number): Promise<void> {
    await this.request<void>(`/talons/${id}`, {
      method: "DELETE",
    });
  }

  // Appointment Statuses
  async getAppointmentStatuses(): Promise<AppointmentStatus[]> {
    try {
      const response = await this.request<{
        data: AppointmentStatus[];
        total: number;
        page: number;
        limit: number;
      }>("/talonstatuses");
      return response.data || [];
    } catch (error) {
      console.warn(
        "API недоступен для статусов записей, возвращаем пустой массив:",
        error,
      );
      return [];
    }
  }

  async getAppointmentStatus(id: number): Promise<AppointmentStatus> {
    try {
      return await this.request<AppointmentStatus>(`/talonstatuses/${id}`);
    } catch (error) {
      console.warn("API недоступен для статуса записи:", error);
      throw error;
    }
  }

  async prefetchAll(): Promise<void> {
    try {
      // Warm caches quickly (from storage if available)
      void this.getServices();
      void this.getDoctors();
    } catch {
      // ignore prefetch errors
    }
  }

  // Groupservices API methods
  async getServiceGroups(): Promise<GroupServiceInfo[]> {
    try {
      const response = await this.request<{ data: GroupServiceInfo[] }>(
        "/groupservices",
      );
      return response.data || [];
    } catch (error) {
      console.warn(
        "API недоступен для групп услуг, возвращаем пустой массив:",
        error,
      );
      return [];
    }
  }

  async getGroupServices(
    groupId: number,
    page = 1,
  ): Promise<GroupServicesResponse> {
    try {
      const response = await this.request<GroupServicesResponse>(
        `/groupservices/${groupId}?page=${page}`,
        { timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS },
      );
      return response;
    } catch (error) {
      console.warn(
        `API недоступен для услуг группы ${groupId}, страница ${page}:`,
        error,
      );
      return {
        data: [],
        meta: {
          pagination: { page: 1, pageCount: 1, pageSize: 100, total: 0 },
        },
      };
    }
  }
}

export const archimedService = new ArchimedService();
export default archimedService;
