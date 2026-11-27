'use client';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import adminCatalogService, {
  isCatalogAuthError,
  type DoctorInput,
  type ServiceInput,
} from '../services/adminCatalog';
import archimedService from '../services/archimed';
import certificateAdminService, {
  type AdminCertificate,
} from '../services/certificateAdmin';
import authService, {
  canAccessCabinet,
  canManageCabinet,
  roleLabel,
  type SessionUser,
} from '../services/auth';
import type {
  ApiService,
  ArchimedAppointment,
  ArchimedDoctor,
} from '../types/cms';
import ArchimedAdminPanel from './ArchimedAdminPanel';

const CERTIFICATE_PARAMS = {
  page: 1,
  // Бекенд ограничивает admin/list 20 записями за запрос.
  limit: 20,
  includeFailed: true,
  includeUnsuccessful: true,
};

class SessionExpiredError extends Error {
  constructor() {
    super('Сессия истекла. Войдите снова.');
    this.name = 'SessionExpiredError';
  }
}

function isSessionExpired(error: unknown): boolean {
  return error instanceof Error && error.name === 'SessionExpiredError';
}

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const raw = value.trim();
  const dmy = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return raw.slice(0, 10);
}

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function upsertById<T extends { id: number }>(items: T[], item: T): T[] {
  const index = items.findIndex((current) => current.id === item.id);
  if (index === -1) return [...items, item];
  const next = [...items];
  next[index] = item;
  return next;
}

function formatDate(value?: string): string {
  const iso = toIsoDate(value);
  if (!iso) return 'Не указано';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return value ?? 'Не указано';
  return new Date(year, month - 1, day).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatMoney(amount: number): string {
  return `${(amount || 0).toLocaleString('ru-RU')} ₽`;
}

function formatDateTime(value?: string): string {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Активен',
  partially_used: 'Частично использован',
  used: 'Использован',
  expired: 'Истёк',
  blocked: 'Заблокирован',
  paid: 'Оплачен',
  success: 'Оплачен',
  succeeded: 'Оплачен',
  pending: 'Ожидает оплаты',
  failed: 'Ошибка оплаты',
};

const STATUS_CLASSES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  partially_used: 'bg-yellow-100 text-yellow-800',
  used: 'bg-gray-100 text-gray-700',
  expired: 'bg-orange-100 text-orange-800',
  blocked: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  success: 'bg-green-100 text-green-800',
  succeeded: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

function bankStatusMeta(status?: number | string, name?: string) {
  const normalized =
    typeof status === 'string' ? Number.parseInt(status, 10) : status;
  if (normalized === 2) {
    return { label: name || 'Оплачен', className: 'bg-green-100 text-green-800' };
  }
  if (normalized === 0 || normalized === 1 || normalized === 5) {
    return { label: name || 'В обработке', className: 'bg-yellow-100 text-yellow-800' };
  }
  if (normalized === 3 || normalized === 4 || normalized === 6) {
    return { label: name || 'Неуспешно', className: 'bg-red-100 text-red-800' };
  }
  return { label: name || 'Неизвестно', className: 'bg-slate-100 text-slate-700' };
}

/** Бекенд отдает уже готовые будущие талоны с врачом и услугой. */
type RawUpcomingAppointment = Partial<ArchimedAppointment> & {
  doctor?: { id?: number; name?: string };
  docs?: Array<{ id?: number; name?: string }>;
  service?: { id?: number; name?: string };
  date?: string;
  begintime?: string;
  patientName?: string;
  patientPhone?: string;
  preferredDate?: string;
  preferredTime?: string;
};

function normalizeAppointment(raw: RawUpcomingAppointment): ArchimedAppointment {
  const doc = raw.docs?.[0] ?? raw.doctor;
  return {
    id: Number(raw.id ?? 0),
    status_id: Number(raw.status_id ?? 0),
    patient_name: raw.patient_name ?? raw.patientName ?? '',
    patient_phone: raw.patient_phone ?? raw.patientPhone ?? '',
    patient_email: raw.patient_email,
    preferred_date: raw.preferred_date ?? raw.preferredDate ?? toIsoDate(raw.date),
    preferred_time:
      raw.preferred_time ?? raw.preferredTime ?? raw.begintime?.slice(0, 5),
    comments: raw.comments,
    doctor_id: raw.doctor_id ?? doc?.id,
    doctor_name: raw.doctor_name ?? doc?.name,
    room_name: raw.room_name,
    service_id: raw.service_id ?? raw.service?.id,
    service_name: raw.service_name ?? raw.service?.name,
    created_at: raw.created_at ?? '',
    updated_at: raw.updated_at ?? '',
  };
}

async function fetchUpcomingAppointments(limit = 20): Promise<ArchimedAppointment[]> {
  const response = await fetch(`/api/admin/appointments/upcoming?limit=${limit}`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (response.status === 401 || response.status === 403) {
    throw new SessionExpiredError();
  }
  if (!response.ok) {
    throw new Error(`Не удалось загрузить записи (HTTP ${response.status})`);
  }
  const json = await response.json().catch(() => null);
  const rows: unknown[] = Array.isArray(json)
    ? json
    : Array.isArray((json as { data?: unknown[] } | null)?.data)
      ? (json as { data: unknown[] }).data
      : [];
  return rows
    .filter((item): item is RawUpcomingAppointment => !!item && typeof item === 'object')
    .map(normalizeAppointment);
}

async function refreshArchimedServerCache(): Promise<void> {
  const response = await fetch('/api/admin/archimed/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });
  if (response.status === 401 || response.status === 403) {
    throw new SessionExpiredError();
  }
  if (!response.ok) {
    throw new Error(`Не удалось обновить кэш Архимеда (HTTP ${response.status})`);
  }
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-dark">{value}</p>
    </div>
  );
}

function LoginForm({
  error,
  submitting,
  onSubmit,
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: {
  error: string | null;
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-dark mb-2">Вход в личный кабинет</h1>
          <p className="text-gray-600 mb-6">
            Введите данные сотрудника или врача. Сессия действует 8 часов.
          </p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="cabinet-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email или логин
              </label>
              <input
                id="cabinet-email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="admin@clinicaldan.ru"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="cabinet-password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                id="cabinet-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-5 py-3 bg-primary text-white rounded-md font-medium hover:bg-primaryDark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Входим…' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminCabinetPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [doctors, setDoctors] = useState<ArchimedDoctor[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [appointments, setAppointments] = useState<ArchimedAppointment[]>([]);
  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [archimedUpdatedAt, setArchimedUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Проверяем сессию на каждом заходе в кабинет.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!cancelled) setSession(user);
      } catch (err) {
        if (!cancelled) {
          setAuthError(err instanceof Error ? err.message : 'Не удалось проверить вход');
        }
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadData = useCallback(async (user: SessionUser) => {
    setIsLoading(true);
    setError(null);

    const withCertificates = canManageCabinet(user);
    const results = await Promise.allSettled([
      archimedService.getDoctors(),
      archimedService.getServices(),
      fetchUpcomingAppointments(20),
      withCertificates
        ? certificateAdminService.listCertificates(CERTIFICATE_PARAMS, { allowFallback: false })
        : Promise.resolve(null),
    ]);

    const [doctorsResult, servicesResult, appointmentsResult, certificatesResult] = results;
    if (doctorsResult.status === 'fulfilled') setDoctors(doctorsResult.value);
    if (servicesResult.status === 'fulfilled') setServices(servicesResult.value);
    if (appointmentsResult.status === 'fulfilled') {
      setAppointments(appointmentsResult.value);
    }
    if (certificatesResult.status === 'fulfilled' && certificatesResult.value) {
      setCertificates(certificatesResult.value.data);
    } else {
      setCertificates([]);
    }

    const expired = results.some(
      (result) => result.status === 'rejected' && isSessionExpired(result.reason),
    );
    if (expired) {
      setSession(null);
      setAuthError('Сессия истекла. Войдите снова.');
    } else if (results.some((result) => result.status === 'rejected')) {
      setError('Часть данных не удалось загрузить. Попробуйте обновить.');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (session && canAccessCabinet(session)) {
      void loadData(session);
    }
  }, [session, loadData]);

  useEffect(() => {
    return archimedService.subscribeDoctors((updated) => {
      if (Array.isArray(updated) && updated.length > 0) setDoctors(updated);
    });
  }, []);

  useEffect(() => {
    return archimedService.subscribeServices((updated) => {
      if (Array.isArray(updated) && updated.length > 0) setServices(updated);
    });
  }, []);

  // Как на /doctors и /prices: свежие справочники при открытии и возврате во вкладку.
  useEffect(() => {
    const revalidate = () => {
      if (document.visibilityState === 'visible') {
        archimedService.revalidateDoctors();
        archimedService.revalidateServices();
      }
    };
    revalidate();
    document.addEventListener('visibilitychange', revalidate);
    return () => document.removeEventListener('visibilitychange', revalidate);
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    if (!email.trim() || !password) {
      setAuthError('Укажите email и пароль');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.login({ email, password });
      if (!canAccessCabinet(result.user)) {
        setSession(result.user);
        setAuthError('У этого аккаунта нет доступа к личному кабинету.');
        return;
      }
      setSession(result.user);
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Не удалось войти');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setSession(null);
    setDoctors([]);
    setServices([]);
    setAppointments([]);
    setCertificates([]);
    setArchimedUpdatedAt(null);
  };

  const handleRefresh = async () => {
    if (!session || !canManageCabinet(session)) return;
    setIsRefreshing(true);
    setError(null);
    try {
      await refreshArchimedServerCache();
      await archimedService.refreshAllNow();
      await loadData(session);
      setArchimedUpdatedAt(new Date().toLocaleTimeString('ru-RU'));
    } catch (err) {
      if (isSessionExpired(err)) {
        setSession(null);
        setAuthError('Сессия истекла. Войдите снова.');
      } else {
        setError(
          `Не удалось обновить данные: ${err instanceof Error ? err.message : 'неизвестная ошибка'}`,
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // После успешной мутации закрываем форму сразу, а справочники обновляем в фоне.
  const refreshCatalogAfterMutation = useCallback(() => {
    void archimedService
      .refreshAllNow()
      .then(() => setArchimedUpdatedAt(new Date().toLocaleTimeString('ru-RU')))
      .catch((error: unknown) => {
        if (isCatalogAuthError(error)) {
          setSession(null);
          setAuthError('Сессия истекла. Войдите снова.');
        } else {
          setError('Изменение сохранено, но не удалось обновить справочники');
        }
      });
  }, []);

  const handleCatalogError = useCallback((error: unknown): never => {
    if (isCatalogAuthError(error)) {
      setSession(null);
      setAuthError('Сессия истекла. Войдите снова.');
    }
    throw error;
  }, []);

  const handleSaveDoctor = useCallback(
    async (input: DoctorInput, id?: number): Promise<ArchimedDoctor> => {
      try {
        const saved = id
          ? await adminCatalogService.updateDoctor(id, input)
          : await adminCatalogService.createDoctor(input);
        setDoctors((current) => upsertById(current, saved));
        refreshCatalogAfterMutation();
        return saved;
      } catch (error) {
        return handleCatalogError(error);
      }
    },
    [handleCatalogError, refreshCatalogAfterMutation],
  );

  const handleDeleteDoctor = useCallback(
    async (id: number): Promise<void> => {
      try {
        await adminCatalogService.deleteDoctor(id);
        setDoctors((current) => current.filter((doctor) => doctor.id !== id));
        refreshCatalogAfterMutation();
      } catch (error) {
        handleCatalogError(error);
      }
    },
    [handleCatalogError, refreshCatalogAfterMutation],
  );

  const handleSaveService = useCallback(
    async (input: ServiceInput, id?: number): Promise<ApiService> => {
      try {
        const saved = id
          ? await adminCatalogService.updateService(id, input)
          : await adminCatalogService.createService(input);
        setServices((current) => upsertById(current, saved));
        refreshCatalogAfterMutation();
        return saved;
      } catch (error) {
        return handleCatalogError(error);
      }
    },
    [handleCatalogError, refreshCatalogAfterMutation],
  );

  const handleDeleteService = useCallback(
    async (id: number): Promise<void> => {
      try {
        await adminCatalogService.deleteService(id);
        setServices((current) => current.filter((service) => service.id !== id));
        refreshCatalogAfterMutation();
      } catch (error) {
        handleCatalogError(error);
      }
    },
    [handleCatalogError, refreshCatalogAfterMutation],
  );

  const upcomingAppointments = useMemo(() => {
    const today = todayIso();
    return appointments
      .map((appointment) => ({
        appointment,
        date: toIsoDate(appointment.preferred_date),
      }))
      .filter((item) => item.date && item.date >= today)
      .sort((a, b) => {
        const left = `${a.date}T${a.appointment.preferred_time ?? '00:00'}`;
        const right = `${b.date}T${b.appointment.preferred_time ?? '00:00'}`;
        return left.localeCompare(right);
      })
      .slice(0, 20);
  }, [appointments]);

  const sortedCertificates = useMemo(
    () =>
      [...certificates].sort((a, b) => {
        const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return right - left;
      }),
    [certificates],
  );

  const doctorLabel = (appointment: ArchimedAppointment) => {
    const doctor = appointment.doctor_id
      ? doctors.find((item) => item.id === appointment.doctor_id)
      : undefined;
    if (doctor) {
      return [doctor.name, doctor.name1, doctor.name2].filter(Boolean).join(' ');
    }
    return appointment.doctor_name || 'Врач не указан в Archimed';
  };

  const serviceLabel = (appointment: ArchimedAppointment) => {
    const service = appointment.service_id
      ? services.find((item) => item.id === appointment.service_id)
      : undefined;
    return service?.name || appointment.service_name || 'Не указана в Archimed';
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4]">
        <p className="text-gray-600">Проверяем сессию…</p>
      </div>
    );
  }

  if (!session || !canAccessCabinet(session)) {
    return (
      <>
        {session && (
          <div className="max-w-md mx-auto mt-8 px-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm text-center">
              У аккаунта {session.email} нет доступа к кабинету.
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="ml-2 font-medium underline"
              >
                Выйти
              </button>
            </div>
          </div>
        )}
        <LoginForm
          error={authError}
          submitting={isSubmitting}
          onSubmit={(event) => void handleLogin(event)}
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
      </>
    );
  }

  const isManager = canManageCabinet(session);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">
              {isManager ? 'Личный кабинет администратора' : 'Личный кабинет врача'}
            </h1>
            <p className="text-lg text-gray-600">
              {session.name} · {roleLabel(session.role)}
              {!isManager && session.archimed_doctor_id
                ? ` · Archimed ID ${session.archimed_doctor_id}`
                : ''}
            </p>
            {(isManager || archimedUpdatedAt) && (
              <p className="text-sm text-gray-500 mt-1">
                {archimedUpdatedAt ? `Обновлено: ${archimedUpdatedAt}` : 'Данные из Архимеда и заявок с сайта'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isManager && (
              <button
                type="button"
                onClick={() => void handleRefresh()}
                disabled={isRefreshing}
                className="px-5 py-3 bg-primary text-white rounded-md font-medium hover:bg-primaryDark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isRefreshing ? 'Обновляем…' : 'Обновить все данные'}
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="px-5 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className={`grid grid-cols-2 ${isManager ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 mb-8`}>
          <StatCard label="Врачи" value={doctors.length} />
          <StatCard label="Услуги в прайсе" value={services.length} />
          <StatCard label="Ближайшие записи" value={upcomingAppointments.length} />
          {isManager && <StatCard label="Сертификаты" value={certificates.length} />}
        </div>

        <ArchimedAdminPanel
          doctors={doctors}
          services={services}
          onRefresh={isManager ? handleRefresh : undefined}
          isRefreshing={isRefreshing}
          lastUpdated={archimedUpdatedAt}
          error={null}
          canEdit={isManager}
          onSaveDoctor={handleSaveDoctor}
          onDeleteDoctor={handleDeleteDoctor}
          onSaveService={handleSaveService}
          onDeleteService={handleDeleteService}
        />

        <section className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 mt-8">
          <div className="px-6 py-4 bg-primary text-white flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Ближайшие записи</h2>
            <span className="text-sm text-white/90">
              {upcomingAppointments.length} на ближайшие дни
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-600">Загрузка записей…</div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Ближайших записей не найдено
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Дата и время</th>
                    <th className="px-4 py-3 font-semibold">Пациент</th>
                    <th className="px-4 py-3 font-semibold">Врач</th>
                    <th className="px-4 py-3 font-semibold">Услуга</th>
                    <th className="px-4 py-3 font-semibold">Телефон</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {upcomingAppointments.map(({ appointment, date }) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(date)}
                        <div className="text-xs text-gray-500">
                          {appointment.preferred_time || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {appointment.patient_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {doctorLabel(appointment)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {serviceLabel(appointment)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {appointment.patient_phone || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {isManager && (
          <section className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Купленные сертификаты</h2>
              <span className="text-sm text-white/90">
                Всего: {sortedCertificates.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-gray-600">
                Загрузка сертификатов…
              </div>
            ) : sortedCertificates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Сертификатов не найдено
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Номер</th>
                      <th className="px-4 py-3 font-semibold">Статус</th>
                      <th className="px-4 py-3 font-semibold">Номинал</th>
                      <th className="px-4 py-3 font-semibold">Остаток</th>
                      <th className="px-4 py-3 font-semibold">Клиент</th>
                      <th className="px-4 py-3 font-semibold">Банк</th>
                      <th className="px-4 py-3 font-semibold">Дата</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedCertificates.map((certificate) => {
                      const bank = bankStatusMeta(
                        certificate.payment?.bankStatus,
                        certificate.payment?.bankStatusName,
                      );
                      return (
                        <tr key={certificate.code} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium font-mono">
                            {certificate.code}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                STATUS_CLASSES[certificate.status] ??
                                'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {STATUS_LABELS[certificate.status] ?? certificate.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {formatMoney(certificate.nominalAmount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {formatMoney(certificate.remainingAmount)}
                          </td>
                          <td className="px-4 py-3">
                            {certificate.customerName || '—'}
                            {certificate.customerPhone && (
                              <div className="text-xs text-gray-500">
                                {certificate.customerPhone}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${bank.className}`}
                            >
                              {bank.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                            {formatDateTime(certificate.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
