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
}

export interface RedeemCertificateRequest {
  code: string;
  writeOffAmount: number;
  reason?: string;
  serviceName?: string;
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

class CertificateAdminService {
  private apiBase: string;

  constructor() {
    const certEnv = import.meta.env.VITE_CERTIFICATE_API_URL ?? import.meta.env.VITE_API_URL;
    const raw = typeof certEnv === "string" ? certEnv.replace(/[\s;]+$/, "").replace(/\/+$/, "") : "";
    const isArchimed = /archimed/i.test(raw);
    const url = raw && !isArchimed ? raw : (import.meta.env.PROD ? "https://clinicaldan.ru/api" : "");
    this.apiBase = url ? `${url.replace(/\/$/, "")}/certificate` : "/api/certificate";
  }

  private normalizeCertificate(raw: Record<string, unknown>): AdminCertificate {
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
    };
  }

  async listCertificates(params: ListCertificatesParams = {}): Promise<ListCertificatesResponse> {
    const search = new URLSearchParams();
    if (params.query) search.append("query", params.query.trim());
    if (params.page) search.append("page", String(params.page));
    if (params.limit) search.append("limit", String(params.limit));

    const queryString = search.toString();
    const response = await fetch(
      `${this.apiBase}/admin/list${queryString ? `?${queryString}` : ""}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
      const message = String(errorData.message ?? `HTTP ${response.status}`);
      throw new Error(message);
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
    const response = await fetch(`${this.apiBase}/admin/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
      const message = String(errorData.message ?? `HTTP ${response.status}`);
      throw new Error(message);
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
    const response = await fetch(`${this.apiBase}/admin/history/${encodeURIComponent(code)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
      const message = String(errorData.message ?? `HTTP ${response.status}`);
      throw new Error(message);
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
