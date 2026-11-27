/**
 * Клиент сессионной авторизации бекенда.
 *
 * Бекенд хранит сессию в таблице user_sessions и ставит HttpOnly-cookie
 * (SESSION_COOKIE_NAME, по умолчанию `session`). Токен НЕ возвращается в теле
 * ответа и НЕ сохраняется в localStorage — все запросы идут с credentials:
 * 'include' на относительные пути /api/*, чтобы cookie уходила на тот же origin.
 */

export type SessionRole =
  | 'patient'
  | 'doctor'
  | 'admin'
  | 'staff'
  // легаси-роли бекенд нормализует в guard-ах, но в ответе они ещё могут прийти
  | 'manager'
  | 'senior_manager';

export interface SessionUser {
  id: number | string;
  email: string;
  name: string;
  phone?: string;
  role: SessionRole;
  archimed_doctor_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface SessionLoginResponse {
  user: SessionUser;
  expiresAt?: string;
}

const API_BASE = '/api';
const LEGACY_TOKEN_KEY = 'auth_token';
const LEGACY_USER_KEY = 'user_data';

const MANAGE_ROLES: SessionRole[] = [
  'admin',
  'staff',
  'manager',
  'senior_manager',
];
const CABINET_ROLES: SessionRole[] = [...MANAGE_ROLES, 'doctor'];

export function canManageCabinet(user: SessionUser | null): boolean {
  return !!user && MANAGE_ROLES.includes(user.role);
}

export function canAccessCabinet(user: SessionUser | null): boolean {
  return !!user && CABINET_ROLES.includes(user.role);
}

export function roleLabel(role: SessionRole): string {
  switch (role) {
    case 'admin':
    case 'senior_manager':
      return 'Администратор';
    case 'staff':
    case 'manager':
      return 'Сотрудник';
    case 'doctor':
      return 'Врач';
    default:
      return 'Пациент';
  }
}

function isUnauthorized(status: number): boolean {
  return status === 401 || status === 403;
}

async function readError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data && typeof data === 'object') {
    const payload = (data as { message?: unknown; error?: unknown; payload?: unknown }).message ??
      (data as { error?: unknown }).error ??
      (data as { payload?: { message?: unknown } }).payload;
    if (typeof payload === 'string' && payload) return payload;
    if (payload && typeof payload === 'object' && 'message' in payload) {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }
  }
  return `Ошибка сервера: ${response.status}`;
}

function normalizeUser(raw: unknown): SessionUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<SessionUser> & { fio?: string };
  if (candidate.id === undefined && !candidate.email) return null;
  return {
    id: candidate.id ?? 0,
    email: candidate.email ?? '',
    name: candidate.name ?? candidate.fio ?? candidate.email ?? 'Пользователь',
    phone: candidate.phone,
    role: (candidate.role ?? 'patient') as SessionRole,
    archimed_doctor_id: candidate.archimed_doctor_id,
    created_at: candidate.created_at,
    updated_at: candidate.updated_at,
  };
}

class SessionAuthService {
  /** Текущий пользователь по сессионной cookie. null — значит вход не требуется/сессия истекла. */
  async getCurrentUser(): Promise<SessionUser | null> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
    } catch (error) {
      console.warn('Не удалось проверить сессию:', error);
      return null;
    }

    if (isUnauthorized(response.status)) return null;
    // Пока бекенд не задеплоен, endpoint может отсутствовать — считаем, что входа нет.
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(await readError(response));

    const json = await response.json().catch(() => null);
    const raw = json && typeof json === 'object'
      ? ((json as { user?: unknown; data?: unknown }).user ??
         (json as { data?: unknown }).data ??
         json)
      : null;
    return normalizeUser(raw);
  }

  /** Вход: бекенд ставит HttpOnly-cookie и возвращает { user, expiresAt }. */
  async login(credentials: { email: string; password: string }): Promise<SessionLoginResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    });

    if (!response.ok) throw new Error(await readError(response));

    const json = await response.json().catch(() => null);
    const user = normalizeUser(json && typeof json === 'object'
      ? (json as { user?: unknown }).user
      : null);
    if (!user) throw new Error('Бекенд не вернул данные пользователя');

    this.clearLegacyCredentials();
    return {
      user,
      expiresAt: json && typeof json === 'object'
        ? (json as { expiresAt?: string }).expiresAt
        : undefined,
    };
  }

  /** Выход: бекенд удаляет строку сессии и очищает cookie. */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
    } finally {
      this.clearLegacyCredentials();
    }
  }

  /** Старый JWT в localStorage больше не нужен и может мешать session-guard. */
  private clearLegacyCredentials(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_USER_KEY);
  }
}

export const authService = new SessionAuthService();
export default authService;
