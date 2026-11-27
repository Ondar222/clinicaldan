import type { ApiService, ArchimedDoctor } from "../types/cms";

/**
 * CRUD справочников кабинета.
 *
 * Archimed доступен только на чтение, поэтому бекенд хранит изменения как
 * оверрайды/томстоуны в своей БД и мержит их в ответы /api/archimed/*.
 * Токен не нужен: используется HttpOnly-cookie сессии.
 */
export interface DoctorInput {
  name?: string;
  name1?: string;
  name2?: string;
  type?: string;
  branch?: string;
  category?: string;
  phone?: string;
  info?: string;
}

export interface ServiceInput {
  name?: string;
  code?: string;
  altname?: string;
  group_name?: string;
  group_id?: number | null;
  base_cost?: number;
  cito_cost?: number;
  duration?: number;
  price_web_visible?: boolean;
  info?: string;
}

export class AdminCatalogError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminCatalogError";
    this.status = status;
  }
}

export function isCatalogAuthError(error: unknown): boolean {
  return (
    error instanceof AdminCatalogError &&
    (error.status === 401 || error.status === 403)
  );
}

function errorMessageFrom(status: number, payload: unknown): string {
  if (payload && typeof payload === "object") {
    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.map((item) => String(item)).join("; ");
    }
    if (typeof message === "string" && message.trim()) return message;
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) return error;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return `Не удалось выполнить действие (HTTP ${status})`;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const status = response.status;
    throw new AdminCatalogError(status, errorMessageFrom(status, payload));
  }

  // Бекенд может вернуть как сам объект, так и { data: объект }.
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

const adminCatalogService = {
  createDoctor(data: DoctorInput): Promise<ArchimedDoctor> {
    return request<ArchimedDoctor>("/api/admin/catalog/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateDoctor(id: number, data: DoctorInput): Promise<ArchimedDoctor> {
    return request<ArchimedDoctor>(`/api/admin/catalog/doctors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteDoctor(id: number): Promise<{ success?: boolean }> {
    return request<{ success?: boolean }>(`/api/admin/catalog/doctors/${id}`, {
      method: "DELETE",
    });
  },

  createService(data: ServiceInput): Promise<ApiService> {
    return request<ApiService>("/api/admin/catalog/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateService(id: number, data: ServiceInput): Promise<ApiService> {
    return request<ApiService>(`/api/admin/catalog/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteService(id: number): Promise<{ success?: boolean }> {
    return request<{ success?: boolean }>(`/api/admin/catalog/services/${id}`, {
      method: "DELETE",
    });
  },
};

export default adminCatalogService;
