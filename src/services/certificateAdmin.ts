export type CertificateStatus = "active" | "partially_used" | "used" | "expired" | "blocked";

export interface AdminCertificate {
  id: number;
  code: string;
  nominalAmount: number;
  remainingAmount: number;
  status: CertificateStatus;
  createdAt?: string;
  expiresAt?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  payment?: {
    orderId?: string;
    paymentOrderId?: string;
    localStatus?: number | string;
    bankStatus?: number | string;
    bankStatusName?: string;
    formUrl?: string;
  };
}

export interface ListCertificatesResponse {
  data: AdminCertificate[];
  total: number;
  page: number;
  limit: number;
}

export interface ListCertificatesParams {
  query?: string;
  page?: number;
  limit?: number;
  includeFailed?: boolean;
  includeUnsuccessful?: boolean;
}

export interface RedeemCertificateRequest {
  code: string;
  writeOffAmount: number;
  reason?: string;
  serviceName?: string;
  /** Отправить email-уведомление клиенту о списании */
  notifyEmail?: boolean;
}

export interface RedeemCertificateResponse {
  message: string;
  certificate: AdminCertificate;
  operationId?: string;
}

export interface CertificateRedeemOperation {
  id: string;
  certificateCode: string;
  writeOffAmount: number;
  remainingAmountAfter: number;
  reason?: string;
  serviceName?: string;
  adminName?: string;
  createdAt: string;
}

/** Строка таблицы транзакций (аналог списка в кабинете банка). */
export interface CertificateTransactionRow {
  id: string;
  amount: number;
  currency?: string;
  /** Краткий статус для бейджа: Завершён / Отклонён / В обработке */
  statusLabel: string;
  bankStatus?: number | string;
  /** Код ответа / расшифровка банка */
  responseCode?: string;
  orderId?: string;
  paymentOrderId?: string;
  paymentMethod?: string;
  certificateCode?: string;
  createdAt?: string;
  formUrl?: string;
}

/** Ответ единого endpoint /admin/staff-dashboard */
export interface StaffDashboardResponse {
  certificates: {
    data: AdminCertificate[];
    total: number;
    page: number;
    limit: number;
  };
  transactions: {
    data: CertificateTransactionRow[];
    total: number;
    page: number;
    limit: number;
  };
  purchasedCertificates: {
    data: AdminCertificate[];
    total: number;
    limit: number;
  };
}

/** Параметры запроса к /admin/staff-dashboard */
export interface StaffDashboardParams {
  page?: number;
  limit?: number;
  transactionsLimit?: number;
  purchasedLimit?: number;
  includeFailed?: boolean;
  includeUnsuccessful?: boolean;
}

class CertificateAdminService {
  private apiBase: string;
  private readonly authTokenKey = "auth_token";
  private readonly fallbackStorageKey = "certificate_admin_fallback_data_v1";
  private fallbackModeEnabled = false;

  constructor() {
    const certEnv = import.meta.env.VITE_CERTIFICATE_API_URL ?? import.meta.env.VITE_API_URL;
    const raw = typeof certEnv === "string" ? certEnv.replace(/[\s;]+$/, "").replace(/\/+$/, "") : "";
    const isArchimed = /archimed/i.test(raw);
    const url = raw && !isArchimed ? raw : (import.meta.env.PROD ? "https://clinicaldan.ru/api" : "");
    this.apiBase = url ? `${url.replace(/\/$/, "")}/certificate` : "/api/certificate";
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(this.authTokenKey) : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async parseApiError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: войдите в аккаунт сотрудника, чтобы работать с сертификатами.");
    }
    const message = String(errorData.message ?? `HTTP ${response.status}`);
    throw new Error(message);
  }

  private getFallbackCertificates(): AdminCertificate[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.fallbackStorageKey);
      if (!raw) {
        const seed: AdminCertificate[] = [
          {
            id: 1,
            code: "CERT-2026-0001",
            nominalAmount: 5000,
            remainingAmount: 5000,
            status: "active",
            customerName: "Тестовый клиент",
            customerPhone: "+79230000000",
            createdAt: new Date().toISOString(),
          },
        ];
        window.localStorage.setItem(this.fallbackStorageKey, JSON.stringify(seed));
        return seed;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed as AdminCertificate[] : [];
    } catch {
      return [];
    }
  }

  private setFallbackCertificates(data: AdminCertificate[]): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.fallbackStorageKey, JSON.stringify(data));
  }

  private buildFallbackList(params: ListCertificatesParams): ListCertificatesResponse {
    const query = params.query?.trim().toLowerCase();
    const all = this.getFallbackCertificates();
    const filtered = query
      ? all.filter((item) => item.code.toLowerCase().includes(query))
      : all;
    return {
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: params.limit ?? 50,
    };
  }

  private normalizeCertificate(raw: Record<string, unknown>): AdminCertificate {
    const paymentRaw = raw.payment && typeof raw.payment === "object"
      ? (raw.payment as Record<string, unknown>)
      : null;
    return {
      id: Number(raw.id ?? raw.certificateId ?? 0),
      code: String(raw.code ?? raw.certificateNumber ?? raw.number ?? ""),
      nominalAmount: Number(raw.nominalAmount ?? raw.amount ?? raw.initialAmount ?? 0),
      remainingAmount: Number(raw.remainingAmount ?? raw.balance ?? 0),
      status: String(raw.status ?? "active") as CertificateStatus,
      createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
      expiresAt: typeof raw.expiresAt === "string" ? raw.expiresAt : undefined,
      customerName: typeof raw.customerName === "string" ? raw.customerName : undefined,
      customerPhone: typeof raw.customerPhone === "string" ? raw.customerPhone : undefined,
      customerEmail: typeof raw.customerEmail === "string" ? raw.customerEmail : undefined,
      payment: paymentRaw
        ? {
            orderId: typeof paymentRaw.orderId === "string" ? paymentRaw.orderId : undefined,
            paymentOrderId: typeof paymentRaw.paymentOrderId === "string" ? paymentRaw.paymentOrderId : undefined,
            localStatus: (typeof paymentRaw.localStatus === "number" || typeof paymentRaw.localStatus === "string")
              ? paymentRaw.localStatus
              : undefined,
            bankStatus: (typeof paymentRaw.bankStatus === "number" || typeof paymentRaw.bankStatus === "string")
              ? paymentRaw.bankStatus
              : undefined,
            bankStatusName: typeof paymentRaw.bankStatusName === "string" ? paymentRaw.bankStatusName : undefined,
            formUrl: typeof paymentRaw.formUrl === "string" ? paymentRaw.formUrl : undefined,
          }
        : undefined,
    };
  }

  private normalizeTransactionRow(raw: Record<string, unknown>): CertificateTransactionRow {
    const bankStatus = raw.bankStatus ?? raw.orderStatus ?? raw.status;
    const amount = Number(raw.amount ?? raw.sum ?? raw.orderAmount ?? 0);
    const orderId =
      typeof raw.orderId === "string" ? raw.orderId
        : typeof raw.mdOrder === "string" ? raw.mdOrder
          : typeof raw.orderNumber === "string" ? raw.orderNumber
            : undefined;
    const paymentOrderId = typeof raw.paymentOrderId === "string" ? raw.paymentOrderId : undefined;
    const responseCode =
      typeof raw.bankStatusName === "string" ? raw.bankStatusName
        : typeof raw.actionCodeDescription === "string" ? raw.actionCodeDescription
          : typeof raw.responseMessage === "string" ? raw.responseMessage
            : undefined;
    const paymentMethod =
      typeof raw.paymentMethod === "string" ? raw.paymentMethod
        : typeof raw.pan === "string" ? raw.pan
          : typeof raw.card === "string" ? raw.card
            : undefined;
    const createdAt =
      typeof raw.createdAt === "string" ? raw.createdAt
        : typeof raw.registeredAt === "string" ? raw.registeredAt
          : typeof raw.registered_at === "string" ? raw.registered_at
            : undefined;
    const certificateCode =
      typeof raw.certificateCode === "string" ? raw.certificateCode
        : typeof raw.code === "string" ? raw.code
          : undefined;
    const formUrl = typeof raw.formUrl === "string" ? raw.formUrl : undefined;
    const id = String(raw.id ?? orderId ?? paymentOrderId ?? `tx_${Math.random().toString(36).slice(2)}`);

    const bs = typeof bankStatus === "string" ? Number.parseInt(bankStatus, 10) : bankStatus;
    let statusLabel = "Неизвестно";
    if (bs === 2) statusLabel = "Завершён";
    else if (bs === 0 || bs === 1 || bs === 5) statusLabel = "В обработке";
    else if (bs === 3 || bs === 4 || bs === 6) statusLabel = "Отклонён";

    return {
      id,
      amount,
      currency: typeof raw.currency === "string" ? raw.currency : "RUR",
      statusLabel,
      bankStatus: bankStatus as number | string | undefined,
      responseCode,
      orderId,
      paymentOrderId,
      paymentMethod,
      certificateCode,
      createdAt,
      formUrl,
    };
  }

  /** Если отдельного API нет — одна строка на сертификат из данных оплаты в списке сертификатов. */
  mapCertificatesToTransactionRows(certificates: AdminCertificate[]): CertificateTransactionRow[] {
    return certificates.map((c) => {
      const p = c.payment;
      const bs = p?.bankStatus;
      const nbs = typeof bs === "string" ? Number.parseInt(bs, 10) : bs;
      let statusLabel = "Неизвестно";
      if (nbs === 2) statusLabel = "Завершён";
      else if (nbs === 0 || nbs === 1 || nbs === 5) statusLabel = "В обработке";
      else if (nbs === 3 || nbs === 4 || nbs === 6) statusLabel = "Отклонён";
      return {
        id: `from-cert-${c.id}-${p?.orderId ?? c.code}`,
        amount: c.nominalAmount,
        currency: "RUR",
        statusLabel,
        bankStatus: bs,
        responseCode: p?.bankStatusName,
        orderId: p?.orderId,
        paymentOrderId: p?.paymentOrderId,
        paymentMethod: undefined,
        certificateCode: c.code,
        createdAt: c.createdAt,
        formUrl: p?.formUrl,
      };
    });
  }

  /**
   * Список транзакций оплаты сертификатов.
   * Порядок: GET /admin/transactions-list → GET /admin/transactions → пусто (фронт подставит из сертификатов).
   */
  async listTransactions(limit = 20): Promise<CertificateTransactionRow[]> {
    if (this.fallbackModeEnabled) {
      return [];
    }

    const paths = [
      `/admin/transactions-list?limit=${limit}`,
      `/admin/transactions?limit=${limit}`,
    ];

    for (const path of paths) {
      const response = await fetch(`${this.apiBase}${path}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });
      if (response.status === 404) continue;
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.fallbackModeEnabled = true;
          return [];
        }
        continue;
      }
      const json = await response.json().catch(() => ({} as Record<string, unknown>));
      const rowsRaw: unknown[] = Array.isArray(json.data) ? json.data : [];
      if (rowsRaw.length === 0) continue;
      return rowsRaw
        .filter((item: unknown): item is Record<string, unknown> => !!item && typeof item === "object")
        .map((item: Record<string, unknown>) => this.normalizeTransactionRow(item));
    }
    return [];
  }

  /**
   * Единый запрос для панели сотрудника: сертификаты, транзакции и оплаченные сертификаты.
   * GET /admin/staff-dashboard?page=1&limit=20&transactionsLimit=50&purchasedLimit=20&includeFailed=true&includeUnsuccessful=true
   */
  async fetchStaffDashboardData(params: StaffDashboardParams = {}): Promise<StaffDashboardResponse> {
    if (this.fallbackModeEnabled) {
      const certs = this.getFallbackCertificates();
      return {
        certificates: { data: certs, total: certs.length, page: 1, limit: params.limit ?? 20 },
        transactions: { data: [], total: 0, page: 1, limit: params.transactionsLimit ?? 50 },
        purchasedCertificates: { data: [], total: 0, limit: params.purchasedLimit ?? 20 },
      };
    }

    const search = new URLSearchParams();
    if (params.page) search.append("page", String(params.page));
    if (params.limit) search.append("limit", String(params.limit));
    if (params.transactionsLimit) search.append("transactionsLimit", String(params.transactionsLimit));
    if (params.purchasedLimit) search.append("purchasedLimit", String(params.purchasedLimit));
    if (params.includeFailed) search.append("includeFailed", "true");
    if (params.includeUnsuccessful) search.append("includeUnsuccessful", "true");

    const queryString = search.toString();
    const response = await fetch(
      `${this.apiBase}/admin/staff-dashboard${queryString ? `?${queryString}` : ""}`,
      { method: "GET", headers: this.getAuthHeaders(), credentials: "include" }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this.fallbackModeEnabled = true;
        return {
          certificates: { data: [], total: 0, page: 1, limit: params.limit ?? 20 },
          transactions: { data: [], total: 0, page: 1, limit: params.transactionsLimit ?? 50 },
          purchasedCertificates: { data: [], total: 0, limit: params.purchasedLimit ?? 20 },
        };
      }
      await this.parseApiError(response);
    }

    const json = await response.json().catch(() => ({} as Record<string, unknown>));

    // Normalize certificates
    const certsRaw: unknown[] = Array.isArray(json.certificates?.data) ? json.certificates.data : [];
    const certificates = certsRaw
      .filter((item: unknown): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item: Record<string, unknown>) => this.normalizeCertificate(item));

    // Normalize transactions
    const txRaw: unknown[] = Array.isArray(json.transactions?.data) ? json.transactions.data : [];
    const transactions = txRaw
      .filter((item: unknown): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item: Record<string, unknown>) => this.normalizeTransactionRow(item));

    // Normalize purchased certificates (only PAID)
    const purchasedRaw: unknown[] = Array.isArray(json.purchasedCertificates?.data) ? json.purchasedCertificates.data : [];
    const purchasedCertificates = purchasedRaw
      .filter((item: unknown): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item: Record<string, unknown>) => this.normalizeCertificate(item));

    return {
      certificates: {
        data: certificates,
        total: Number(json.certificates?.total ?? certificates.length),
        page: Number(json.certificates?.page ?? 1),
        limit: Number(json.certificates?.limit ?? params.limit ?? 20),
      },
      transactions: {
        data: transactions,
        total: Number(json.transactions?.total ?? transactions.length),
        page: Number(json.transactions?.page ?? 1),
        limit: Number(json.transactions?.limit ?? params.transactionsLimit ?? 50),
      },
      purchasedCertificates: {
        data: purchasedCertificates,
        total: Number(json.purchasedCertificates?.total ?? purchasedCertificates.length),
        limit: Number(json.purchasedCertificates?.limit ?? params.purchasedLimit ?? 20),
      },
    };
  }

  async listCertificates(params: ListCertificatesParams = {}): Promise<ListCertificatesResponse> {
    if (this.fallbackModeEnabled) {
      return this.buildFallbackList(params);
    }

    const search = new URLSearchParams();
    if (params.query) search.append("query", params.query.trim());
    if (params.page) search.append("page", String(params.page));
    if (params.limit) search.append("limit", String(params.limit));
    if (params.includeFailed) search.append("includeFailed", "true");
    if (params.includeUnsuccessful) search.append("includeUnsuccessful", "true");

    const queryString = search.toString();
    const response = await fetch(
      `${this.apiBase}/admin/list${queryString ? `?${queryString}` : ""}`,
      { method: "GET", headers: this.getAuthHeaders(), credentials: "include" }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this.fallbackModeEnabled = true;
        return this.buildFallbackList(params);
      }
      await this.parseApiError(response);
    }

    const json = await response.json().catch(() => ({} as Record<string, unknown>));
    const rowsRaw: unknown[] = Array.isArray(json.data) ? json.data : [];
    const rows = rowsRaw
      .filter((item: unknown): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item: Record<string, unknown>) => this.normalizeCertificate(item));

    return {
      data: rows,
      total: Number(json.total ?? rows.length),
      page: Number(json.page ?? 1),
      limit: Number(json.limit ?? params.limit ?? 50),
    };
  }

  async redeemCertificate(payload: RedeemCertificateRequest): Promise<RedeemCertificateResponse> {
    if (this.fallbackModeEnabled) {
      const certificates = this.getFallbackCertificates();
      const cert = certificates.find((item) => item.code === payload.code);
      if (!cert) throw new Error("Сертификат не найден.");
      if (payload.writeOffAmount <= 0) throw new Error("Сумма списания должна быть больше 0.");
      if (payload.writeOffAmount > cert.remainingAmount) {
        throw new Error("Сумма списания не может быть больше остатка сертификата.");
      }

      const nextRemaining = cert.remainingAmount - payload.writeOffAmount;
      const nextStatus: CertificateStatus = nextRemaining === 0 ? "used" : "partially_used";
      const updated: AdminCertificate = {
        ...cert,
        remainingAmount: nextRemaining,
        status: nextStatus,
      };
      const nextData = certificates.map((item) => (item.code === cert.code ? updated : item));
      this.setFallbackCertificates(nextData);

      return {
        message: "Списание выполнено (локальный режим без авторизации)",
        certificate: updated,
        operationId: `local_${Date.now()}`,
      };
    }

    const response = await fetch(`${this.apiBase}/admin/redeem`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this.fallbackModeEnabled = true;
        return this.redeemCertificate(payload);
      }
      await this.parseApiError(response);
    }

    const json = await response.json().catch(() => ({} as Record<string, unknown>));
    const rawCert = json.certificate && typeof json.certificate === "object"
      ? (json.certificate as Record<string, unknown>)
      : (json as Record<string, unknown>);

    return {
      message: String(json.message ?? "Списание выполнено"),
      certificate: this.normalizeCertificate(rawCert),
      operationId: typeof json.operationId === "string" ? json.operationId : undefined,
    };
  }

  async getCertificateHistory(code: string): Promise<CertificateRedeemOperation[]> {
    if (this.fallbackModeEnabled) {
      return [];
    }

    const response = await fetch(`${this.apiBase}/admin/history/${encodeURIComponent(code)}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this.fallbackModeEnabled = true;
        return [];
      }
      await this.parseApiError(response);
    }

    const json = await response.json().catch(() => ({} as Record<string, unknown>));
    const rowsRaw: unknown[] = Array.isArray(json.data) ? json.data : [];
    return rowsRaw
      .filter((item: unknown): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item: Record<string, unknown>) => ({
        id: String(item.id ?? item.operationId ?? ""),
        certificateCode: String(item.certificateCode ?? item.code ?? code),
        writeOffAmount: Number(item.writeOffAmount ?? item.amount ?? 0),
        remainingAmountAfter: Number(item.remainingAmountAfter ?? item.balanceAfter ?? 0),
        reason: typeof item.reason === "string" ? item.reason : undefined,
        serviceName: typeof item.serviceName === "string" ? item.serviceName : undefined,
        adminName: typeof item.adminName === "string" ? item.adminName : undefined,
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      }));
  }
}

export const certificateAdminService = new CertificateAdminService();
export default certificateAdminService;
