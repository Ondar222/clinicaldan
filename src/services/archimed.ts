import type {
  ArchimedDoctor,
  ArchimedZone,
  ArchimedBranch,
  ArchimedCategory,
  ArchimedScientificDegree,
  ApiService,
  AppointmentData,
  ArchimedAppointment,
  AppointmentStatus
} from '../types/cms';
import { mockServices } from '../data/mockServices';
import { mockDoctors, mockBranches } from '../data/mockDoctors';

// Archimed API configuration
const ARCHIMED_API_URL = import.meta.env.VITE_ARCHIMED_API_URL || 'https://newapi.archimed-soft.ru/api/v5';
const ARCHIMED_API_TOKEN = import.meta.env.VITE_ARCHIMED_API_TOKEN || '';
// Public gateway (proxy) that may already aggregate Archimed doctors for this site
const PUBLIC_DOCTORS_URL = 'https://aldan.yurta.site/api/archimed/doctors';

console.log('Environment variables:');
console.log('VITE_ARCHIMED_API_URL:', import.meta.env.VITE_ARCHIMED_API_URL);
console.log('VITE_ARCHIMED_API_TOKEN:', import.meta.env.VITE_ARCHIMED_API_TOKEN);
console.log('Final ARCHIMED_API_URL:', ARCHIMED_API_URL);
console.log('Final ARCHIMED_API_TOKEN:', ARCHIMED_API_TOKEN);
// Some deployments don't have categories endpoint – disable to avoid 404 requests
const ARCHIMED_CATEGORIES_ENABLED = false;

// Local cache settings
const DOCTORS_CACHE_KEY = 'archimed_doctors_v1';
const SERVICES_CACHE_KEY = 'archimed_services_v1';
const DOCTORS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const SERVICES_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const DEFAULT_REQUEST_TIMEOUT_MS = 20000; // 20s
const DEFAULT_API_PAGE_LIMIT = 200; // request large page size to reduce pagination
const MAX_API_PAGES = 50; // hard cap to prevent runaway loops

// Helpers for name normalization and blacklist
const normalizeRu = (s: string) =>
  (s || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/g, ' ')
    .trim();

const makeFullName = (d: ArchimedDoctor) =>
  normalizeRu([d?.name, d?.name1, d?.name2].filter(Boolean).join(' '));

// Names to exclude from all doctors lists and details
const NAME_BLACKLIST = new Set<string>([
  'хорбаа анжела тарасовна',
]);

class ArchimedService {
  private baseUrl: string;
  private headers: HeadersInit;
  private servicesCache: ApiService[] = [];
  private doctorsCache: ArchimedDoctor[] = [];

  constructor() {
    this.baseUrl = ARCHIMED_API_URL;
    this.headers = {
      'Content-Type': 'application/json',
      ...(ARCHIMED_API_TOKEN && { 'Authorization': `Bearer ${ARCHIMED_API_TOKEN}` }),
    };

    console.log('ArchimedService constructor, API URL:', this.baseUrl);
    console.log('API Token configured:', !!ARCHIMED_API_TOKEN);

    // Warm caches from localStorage on startup for instant UI
    try {
      const doctorsFromStorage = this.readFromStorage<unknown>(DOCTORS_CACHE_KEY, DOCTORS_CACHE_TTL_MS);
      if (Array.isArray(doctorsFromStorage)) {
        console.log('Loaded doctors from storage:', doctorsFromStorage.length);
        this.doctorsCache = this.applyRemovals(doctorsFromStorage as ArchimedDoctor[]);
      } else if (doctorsFromStorage && typeof doctorsFromStorage === 'object' && Array.isArray((doctorsFromStorage as any).data)) {
        const normalized = (doctorsFromStorage as any).data as ArchimedDoctor[];
        console.log('Loaded doctors from storage (normalized from .data):', normalized.length);
        this.doctorsCache = this.applyRemovals(normalized);
        this.writeToStorage(DOCTORS_CACHE_KEY, this.doctorsCache);
      }
      const servicesFromStorage = this.readFromStorage<ApiService[]>(SERVICES_CACHE_KEY, SERVICES_CACHE_TTL_MS);
      if (servicesFromStorage) {
        console.log('Loaded services from storage:', servicesFromStorage.length);
        this.servicesCache = servicesFromStorage;
      }
    } catch (error) {
      console.log('Storage error:', error);
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit & { timeoutMs?: number; suppressErrorLog?: boolean }): Promise<T> {
    if (!this.baseUrl) {
      throw new Error('ARCHIMED_API_URL not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort('timeout'), options?.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: this.headers,
        signal: controller.signal,
        ...options,
      });
    } catch (e) {
      window.clearTimeout(timeout);
      if ((e as Error)?.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw e;
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (!options?.suppressErrorLog) {
        console.error('API error response:', errorText);
      }
      throw new Error(`Archimed API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private readFromStorage<T>(key: string, ttlMs: number): T | null {
    try {
      if (typeof window === 'undefined') return null;
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { data: T; timestamp: number };
      if (!parsed || !parsed.data || !parsed.timestamp) return null;
      const isFresh = Date.now() - parsed.timestamp < ttlMs;
      return isFresh ? parsed.data : parsed.data; // return stale data too; we'll revalidate
    } catch {
      return null;
    }
  }

  private writeToStorage<T>(key: string, data: T): void {
    try {
      if (typeof window === 'undefined') return;
      const payload = JSON.stringify({ data, timestamp: Date.now() });
      window.localStorage.setItem(key, payload);
    } catch {
      // ignore storage errors
    }
  }

  // Doctors
  async getDoctors(): Promise<ArchimedDoctor[]> {
    console.log('getDoctors called, cache length:', this.doctorsCache.length);

    if (this.doctorsCache.length > 0) {
      console.log('Returning cached doctors:', this.doctorsCache.length);
      // Revalidate in background for freshness
      this.refreshDoctors();
      return this.doctorsCache;
    }

    const fromStorage = this.readFromStorage<unknown>(DOCTORS_CACHE_KEY, DOCTORS_CACHE_TTL_MS);
    if (Array.isArray(fromStorage) && fromStorage.length > 0) {
      console.log('Loading doctors from storage:', fromStorage.length);
      this.doctorsCache = this.applyRemovals(fromStorage as ArchimedDoctor[]);
      // refresh in background
      this.refreshDoctors();
      return this.doctorsCache;
    }
    if (fromStorage && typeof fromStorage === 'object' && Array.isArray((fromStorage as any).data)) {
      const normalized = (fromStorage as any).data as ArchimedDoctor[];
      console.log('Loading doctors from storage (normalized from .data):', normalized.length);
      this.doctorsCache = this.applyRemovals(normalized);
      this.writeToStorage(DOCTORS_CACHE_KEY, this.doctorsCache);
      this.refreshDoctors();
      return this.doctorsCache;
    }

    console.log('No cached data, trying public site API, then Archimed API, then local file...');
    try {
      // 1) Try public gateway first (absolute URL)
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort('timeout'), DEFAULT_REQUEST_TIMEOUT_MS);
      const publicUrl = `${PUBLIC_DOCTORS_URL}?limit=${DEFAULT_API_PAGE_LIMIT}`;
      const siteResp = await fetch(publicUrl, { signal: controller.signal });
      window.clearTimeout(timeoutId);
      if (siteResp.ok) {
        const siteJson = await siteResp.json();
        const publicData = Array.isArray(siteJson) ? siteJson : (siteJson?.data || []);
        let bestData: ArchimedDoctor[] = Array.isArray(publicData) ? (publicData as ArchimedDoctor[]) : [];

        // Try to fetch full list directly from Archimed API; prefer larger dataset if available
        try {
          const apiAll = await this.fetchAllDoctorsFromAPI();
          if (Array.isArray(apiAll) && apiAll.length > bestData.length) {
            bestData = apiAll;
          }
        } catch (e) {
          console.warn('Failed to enrich doctors from Archimed API, using public data if present:', e);
        }

        if (bestData.length > 0) {
          console.log('Using doctors dataset, count:', bestData.length);
          this.doctorsCache = this.applyRemovals(bestData);
          this.writeToStorage(DOCTORS_CACHE_KEY, this.doctorsCache);
          return this.doctorsCache;
        }
      }

      // 2) Fallback to Archimed API directly
      const allDoctors = await this.fetchAllDoctorsFromAPI();
      console.log('Archimed API returned doctors:', allDoctors?.length || 0);
      this.doctorsCache = allDoctors || [];

      // If API returned too few, try to enrich from ProDoctorov local snapshot
      if (this.doctorsCache.length < 10) {
        const proDocs = await this.loadProdoctorovSnapshot();
        if (proDocs.length > 0) {
          console.log('Enriching doctors with ProDoctorov snapshot:', proDocs.length);
          this.doctorsCache = this.mergeDoctors(this.doctorsCache, proDocs);
        }
      }
      this.doctorsCache = this.applyRemovals(this.doctorsCache);
      this.writeToStorage(DOCTORS_CACHE_KEY, this.doctorsCache);
      return this.doctorsCache;
    } catch (error) {
      console.warn('API недоступен, пробуем загрузить локальный файл doctors.json. Ошибка:', error);
      try {
        // 3) Fallback to local doctors.json (real data snapshot)
        const localModule = await import('../data/doctors.json');
        const raw = (localModule as any).default;
        const localDoctors: ArchimedDoctor[] = Array.isArray(raw)
          ? (raw as ArchimedDoctor[])
          : (Array.isArray(raw?.data) ? (raw.data as ArchimedDoctor[]) : []);
        this.doctorsCache = localDoctors;

        // Enrich from ProDoctorov snapshot if available
        if (this.doctorsCache.length < 10) {
          const proDocs = await this.loadProdoctorovSnapshot();
          if (proDocs.length > 0) {
            console.log('Enriching local doctors.json with ProDoctorov snapshot:', proDocs.length);
            this.doctorsCache = this.mergeDoctors(this.doctorsCache, proDocs);
          }
        }
        this.doctorsCache = this.applyRemovals(this.doctorsCache);
        this.writeToStorage(DOCTORS_CACHE_KEY, this.doctorsCache);
        console.log('Using local doctors.json:', this.doctorsCache.length);
        return this.doctorsCache;
      } catch (e) {
        console.warn('Не удалось загрузить doctors.json, используем mockDoctors. Ошибка:', e);
        // 4) Last resort – mock data
        this.doctorsCache = mockDoctors;
        const proDocs = await this.loadProdoctorovSnapshot();
        if (proDocs.length > 0) {
          console.log('Enriching mock doctors with ProDoctorov snapshot:', proDocs.length);
          this.doctorsCache = this.mergeDoctors(this.doctorsCache, proDocs);
        }
        this.doctorsCache = this.applyRemovals(this.doctorsCache);
        this.writeToStorage(DOCTORS_CACHE_KEY, this.doctorsCache);
        console.log('Using mock doctors:', this.doctorsCache.length);
        return this.doctorsCache;
      }
    }
  }

  async getDoctor(id: number): Promise<ArchimedDoctor> {
    const doc = await this.request<ArchimedDoctor>(`/doctors/${id}`);
    if (this.isBlacklisted(doc)) {
      throw new Error('Archimed API error: 404 - Not found');
    }
    return doc;
  }

  async getDoctorsByBranch(branchId: number): Promise<ArchimedDoctor[]> {
    const data = await this.request<{ data: ArchimedDoctor[] }>(`/doctors?branch_id=${branchId}`);
    return data.data;
  }

  async getDoctorsByType(typeId: number): Promise<ArchimedDoctor[]> {
    const data = await this.request<{ data: ArchimedDoctor[] }>(`/doctors?type_id=${typeId}`);
    return data.data;
  }

  // Services (from Archimed)
  async getServices(): Promise<ApiService[]> {
    if (this.servicesCache.length > 0) {
      this.refreshServices();
      return this.servicesCache;
    }
    const fromStorage = this.readFromStorage<ApiService[]>(SERVICES_CACHE_KEY, SERVICES_CACHE_TTL_MS);
    if (fromStorage && fromStorage.length > 0) {
      this.servicesCache = fromStorage;
      this.refreshServices();
      return this.servicesCache;
    }

    try {
      const response = await this.request<{ data: ApiService[]; total: number; page: number; limit: number }>('/services');
      this.servicesCache = response.data || [];
      this.writeToStorage(SERVICES_CACHE_KEY, this.servicesCache);
      return this.servicesCache;
    } catch (error) {
      console.warn('API недоступен, используем моковые данные для услуг:', error);
      // Используем моковые данные при ошибке API
      this.servicesCache = mockServices;
      this.writeToStorage(SERVICES_CACHE_KEY, this.servicesCache);
      return this.servicesCache;
    }
  }

  async getService(id: number): Promise<ApiService> {
    return this.request<ApiService>(`/services/${id}`);
  }

  async getServicesByGroup(groupId: number): Promise<ApiService[]> {
    try {
      const response = await this.request<{ data: ApiService[]; total: number; page: number; limit: number }>(`/services?group_id=${groupId}`);
      return response.data || [];
    } catch (error) {
      console.warn('API недоступен для услуг группы, возвращаем пустой массив:', error);
      return [];
    }
  }

  // Zones
  async getZones(): Promise<ArchimedZone[]> {
    try {
      const response = await this.request<{ data: ArchimedZone[]; total: number; page: number; limit: number }>('/zones');
      return response.data || [];
    } catch (error) {
      console.warn('API недоступен для зон, возвращаем пустой массив:', error);
      return [];
    }
  }

  // Branches
  async getBranches(): Promise<ArchimedBranch[]> {
    try {
      const response = await this.request<{ data: ArchimedBranch[]; total: number; page: number; limit: number }>('/branchs');
      return response.data || [];
    } catch (error) {
      console.warn('API недоступен, используем моковые данные для филиалов:', error);
      return mockBranches;
    }
  }

  // Categories
  async getCategories(): Promise<ArchimedCategory[]> {
    if (!ARCHIMED_CATEGORIES_ENABLED) {
      return [] as ArchimedCategory[];
    }
    try {
      const response = await this.request<{ data: ArchimedCategory[]; total: number; page: number; limit: number }>(
        '/categories',
        { suppressErrorLog: true }
      );
      return response.data || [];
    } catch {
      return [] as ArchimedCategory[];
    }
  }

  // Scientific Degrees
  async getScientificDegrees(): Promise<ArchimedScientificDegree[]> {
    try {
      const response = await this.request<{ data: ArchimedScientificDegree[]; total: number; page: number; limit: number }>('/scientific_degrees');
      return response.data || [];
    } catch (error) {
      console.warn('API недоступен для научных степеней, возвращаем пустой массив:', error);
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

  // Background refreshers (stale-while-revalidate)
  private async refreshDoctors(): Promise<void> {
    try {
      const allDoctors = await this.fetchAllDoctorsFromAPI();
      if (Array.isArray(allDoctors) && allDoctors.length > 0) {
        this.doctorsCache = this.applyRemovals(allDoctors);
        this.writeToStorage(DOCTORS_CACHE_KEY, this.doctorsCache);
      }
    } catch {
      // keep stale cache on failure
    }
  }

  private async fetchAllDoctorsFromAPI(): Promise<ArchimedDoctor[]> {
    const all: ArchimedDoctor[] = [];
    let page = 1;

    // If base URL is not configured, short-circuit
    if (!this.baseUrl) return all;

    // Try to fetch a large single page first
    try {
      const first = await this.request<{ data: ArchimedDoctor[]; total: number; page: number; limit: number }>(
        `/doctors?page=${page}&limit=${DEFAULT_API_PAGE_LIMIT}`,
        { timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS }
      );
      const total = (first as any)?.total ?? (first?.data?.length ?? 0);
      const limit = (first as any)?.limit ?? DEFAULT_API_PAGE_LIMIT;
      if (Array.isArray(first?.data)) {
        all.push(...first.data);
      }
      const totalPages = limit > 0 ? Math.ceil((total || all.length) / limit) : 1;

      // Fetch remaining pages if needed
      for (page = 2; page <= Math.min(totalPages, MAX_API_PAGES); page++) {
        const next = await this.request<{ data: ArchimedDoctor[]; total: number; page: number; limit: number }>(
          `/doctors?page=${page}&limit=${limit}`,
          { timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS }
        );
        if (Array.isArray(next?.data) && next.data.length > 0) {
          all.push(...next.data);
          if (next.data.length < limit) break; // last page
        } else {
          break;
        }
      }
    } catch (e) {
      console.warn('Error fetching all doctors from API:', e);
    }

    return all;
  }

  // Load and map ProDoctorov snapshot if present
  private async loadProdoctorovSnapshot(): Promise<ArchimedDoctor[]> {
    try {
      const module = await import('../data/prodoctorov.json');
      const raw = (module as any).default;
      const list: Array<{
        fullName: string;
        specialty: string;
        photo?: string;
        category?: string;
        scientific_degree?: string;
        experienceStartYear?: number;
        extraSpecialties?: string[];
      }>
        = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      if (!Array.isArray(list) || list.length === 0) return [];
      const mapped: ArchimedDoctor[] = list.map((item, idx) => this.mapProdoctorovToArchimed(item, idx));
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
    index: number
  ): ArchimedDoctor {
    const [lastName = '', firstName = '', middleName = ''] = item.fullName.split(/\s+/);
    const typeName = item.specialty || 'Врач';
    const id = 100000 + index; // avoid id collisions
    const defaultBranch = 'Клиника Алдан';
    const defaultCategory = item.category || typeName;
    const degree = item.scientific_degree || 'Без степени';
    const extraTypes = Array.isArray(item.extraSpecialties) ? item.extraSpecialties : [];
    const experienceInfo = item.experienceStartYear ? `Врачебный стаж с ${item.experienceStartYear} г.` : '';
    const extraInfo = extraTypes.length > 0 ? `Смежные специальности: ${extraTypes.join(', ')}` : '';
    const info = [experienceInfo, extraInfo].filter(Boolean).join('\n');
    return {
      id,
      name: lastName,
      name1: firstName,
      name2: middleName,
      type: typeName,
      code: '',
      max_time: '30',
      phone: '',
      snils: '',
      info,
      zone_id: 0,
      zone: '',
      branch_id: 0,
      branch: defaultBranch,
      category_id: 0,
      category: defaultCategory,
      scientific_degree_id: 0,
      scientific_degree: degree,
      user_id: 0,
      photo: item.photo || null,
      address: 'г. Кызыл, ул. Ленина, 60',
      building_name: 'Поликлиника №1',
      building_web_name: 'Поликлиника №1',
      primary_type_id: 0,
      types: [{ id: 0, name: typeName }, ...extraTypes.map((n, i) => ({ id: i + 1, name: n }))]
    };
  }

  private mergeDoctors(primary: ArchimedDoctor[], extra: ArchimedDoctor[]): ArchimedDoctor[] {
    const normalize = (s: string) => (s || '').toLowerCase().replace(/ё/g, 'е').trim();
    const makeNameKey = (d: ArchimedDoctor) => `${normalize(d.name)}|${normalize(d.name1)}|${normalize(d.name2)}`;

    const byName = new Map<string, ArchimedDoctor>();
    for (const d of primary) byName.set(makeNameKey(d), d);

    const mergeOne = (base: ArchimedDoctor, add: ArchimedDoctor): ArchimedDoctor => {
      const isEmpty = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

      const merged: ArchimedDoctor = { ...base };

      // Photo
      if ((!base.photo || base.photo === '') && add.photo) merged.photo = add.photo;

      // Scientific degree
      const baseDeg = normalize(base.scientific_degree || '');
      const addDeg = normalize(add.scientific_degree || '');
      if ((isEmpty(base.scientific_degree) || baseDeg === 'без степени') && addDeg && addDeg !== 'без степени') {
        merged.scientific_degree = add.scientific_degree;
      }

      // Category: prefer explicit categories like "Высшая категория", "Первая категория", etc.
      const looksLikeCategory = (s: string) => /(категор)/i.test(s);
      if ((isEmpty(base.category) || !looksLikeCategory(base.category)) && looksLikeCategory(add.category)) {
        merged.category = add.category;
      }

      // Info: append experience and extras if missing
      const infoText = base.info || '';
      const addInfo = add.info || '';
      const hasExperience = /стаж\s+с\s+\d{4}/i.test(infoText) || /врачебный\s+стаж\s+с\s+\d{4}/i.test(infoText);
      const addHasExperience = /стаж\s+с\s+\d{4}/i.test(addInfo) || /врачебный\s+стаж\s+с\s+\d{4}/i.test(addInfo);
      const parts: string[] = [];
      if (infoText) parts.push(infoText);
      if (!hasExperience && addHasExperience) parts.push(addInfo.split(/\n+/)[0]);
      // Include extra specialties line if present in add.info and not already present
      const addExtrasLine = addInfo.split(/\n+/).find((l) => /Смежные специальности/i.test(l));
      if (addExtrasLine && !/Смежные специальности/i.test(infoText)) parts.push(addExtrasLine);
      merged.info = parts.filter(Boolean).join('\n');

      // Types: merge unique type names
      const baseTypeNames = new Set<string>([normalize(base.type), ...(base.types || []).map((t) => normalize(t.name))]);
      const addTypeNames = new Set<string>([normalize(add.type), ...(add.types || []).map((t) => normalize(t.name))]);
      const mergedTypeNames = new Set<string>([...baseTypeNames]);
      for (const n of addTypeNames) if (n && !mergedTypeNames.has(n)) mergedTypeNames.add(n);
      const materialized = Array.from(mergedTypeNames)
        .filter(Boolean)
        .map((name, idx) => ({ id: idx, name } as ArchimedDoctor['types'][number])) as ArchimedDoctor['types'];
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
      } else {
        byName.set(key, add);
      }
    }

    return Array.from(byName.values());
  }

  private isBlacklisted(doctor: ArchimedDoctor): boolean {
    try {
      const full = makeFullName(doctor);
      return NAME_BLACKLIST.has(full);
    } catch {
      return false;
    }
  }

  private applyRemovals(list: ArchimedDoctor[]): ArchimedDoctor[] {
    try {
      return (Array.isArray(list) ? list : []).filter(d => !this.isBlacklisted(d));
    } catch {
      return Array.isArray(list) ? list : [];
    }
  }

  // Public helpers to link services with doctors
  async getDoctorsWithServices(): Promise<Array<ArchimedDoctor & { services?: ApiService[] }>> {
    const [doctors, services] = await Promise.all([
      this.getDoctors(),
      this.getServices().catch(() => [] as ApiService[])
    ]);
    const normalized = (s: string) => (s || '').toLowerCase().replace(/ё/g, 'е');
    const tokenize = (s: string) => normalized(s).split(/\s+/).filter(Boolean);
    const result = doctors.map(d => {
      const docTokens = new Set<string>([...tokenize(d.type), ...(d.types || []).flatMap(t => tokenize(t.name))]);
      const matched = services.filter(svc => {
        const svcTokens = new Set<string>([...tokenize(svc.group_name), ...tokenize(svc.name)]);
        for (const t of docTokens) if (svcTokens.has(t)) return true;
        return false;
      });
      return { ...d, services: matched };
    });
    return result;
  }

  async getServicesWithDoctors(): Promise<Array<ApiService & { doctors?: ArchimedDoctor[] }>> {
    const [doctors, services] = await Promise.all([
      this.getDoctors(),
      this.getServices().catch(() => [] as ApiService[])
    ]);
    const normalized = (s: string) => (s || '').toLowerCase().replace(/ё/g, 'е');
    const tokenize = (s: string) => normalized(s).split(/\s+/).filter(Boolean);
    const svcWithDocs = services.map(svc => {
      const svcTokens = new Set<string>([...tokenize(svc.group_name), ...tokenize(svc.name)]);
      const matched = doctors.filter(d => {
        const docTokens = new Set<string>([...tokenize(d.type), ...(d.types || []).flatMap(t => tokenize(t.name))]);
        for (const t of docTokens) if (svcTokens.has(t)) return true;
        return false;
      });
      return { ...svc, doctors: matched };
    });
    return svcWithDocs;
  }

  private async refreshServices(): Promise<void> {
    try {
      const response = await this.request<{ data: ApiService[]; total: number; page: number; limit: number }>(
        '/services',
        { timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS }
      );
      if (Array.isArray(response?.data) && response.data.length > 0) {
        this.servicesCache = response.data;
        this.writeToStorage(SERVICES_CACHE_KEY, this.servicesCache);
      }
    } catch {
      // keep stale cache on failure
    }
  }

  // Appointments
  async createAppointment(appointmentData: AppointmentData): Promise<ArchimedAppointment> {
    // Если API токен не настроен, используем моковые данные для тестирования
    if (!ARCHIMED_API_TOKEN) {
      console.warn('API token not configured, using mock data for testing');
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
            updated_at: new Date().toISOString()
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
      doctor_id: appointmentData.doctorId
    };

    return this.request<ArchimedAppointment>('/talons', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getAppointments(filters?: {
    doctorId?: number;
    serviceId?: number;
    statusId?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: ArchimedAppointment[]; total: number; page: number; limit: number }> {
    try {
      const params = new URLSearchParams();

      if (filters?.doctorId) params.append('doctor_id', filters.doctorId.toString());
      if (filters?.serviceId) params.append('service_id', filters.serviceId.toString());
      if (filters?.statusId) params.append('status_id', filters.statusId.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/talons?${queryString}` : '/talons';

      return await this.request<{ data: ArchimedAppointment[]; total: number; page: number; limit: number }>(endpoint);
    } catch (error) {
      console.warn('API недоступен для записей на прием:', error);
      return { data: [], total: 0, page: 1, limit: 100 };
    }
  }

  async getAppointment(id: number): Promise<ArchimedAppointment> {
    return this.request<ArchimedAppointment>(`/talons/${id}`);
  }

  async updateAppointment(id: number, appointmentData: Partial<AppointmentData>): Promise<ArchimedAppointment> {
    const payload = {
      patient_name: appointmentData.patientName,
      patient_phone: appointmentData.patientPhone,
      patient_email: appointmentData.patientEmail,
      preferred_date: appointmentData.preferredDate,
      preferred_time: appointmentData.preferredTime,
      comments: appointmentData.comments,
      service_id: appointmentData.serviceId,
      doctor_id: appointmentData.doctorId
    };

    // Удаляем undefined значения
    Object.keys(payload).forEach(key =>
      payload[key as keyof typeof payload] === undefined && delete payload[key as keyof typeof payload]
    );

    return this.request<ArchimedAppointment>(`/talons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteAppointment(id: number): Promise<void> {
    await this.request<void>(`/talons/${id}`, {
      method: 'DELETE'
    });
  }

  // Appointment Statuses
  async getAppointmentStatuses(): Promise<AppointmentStatus[]> {
    try {
      const response = await this.request<{ data: AppointmentStatus[]; total: number; page: number; limit: number }>('/talonstatuses');
      return response.data || [];
    } catch (error) {
      console.warn('API недоступен для статусов записей, возвращаем пустой массив:', error);
      return [];
    }
  }

  async getAppointmentStatus(id: number): Promise<AppointmentStatus> {
    try {
      return await this.request<AppointmentStatus>(`/talonstatuses/${id}`);
    } catch (error) {
      console.warn('API недоступен для статуса записи:', error);
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
}

export const archimedService = new ArchimedService();
export default archimedService; 