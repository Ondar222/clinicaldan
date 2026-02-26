// Certificate service for API integration

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CreateCertificateRequest {
  amount: number;
  customer: Customer;
  sponsor?: Customer;
  greetingText?: string;
}

export interface CreateCertificateResponse {
  message: string;
  code: string;
  paymentUrl: string;
  orderId: string;
}

export interface CheckPaymentResponse {
  orderStatus: number;
  orderNumber: string;
  amount: number;
  // ... другие поля при необходимости
}

class CertificateService {
  private apiUrl: string;

  constructor() {
    // URL только для API сертификатов/оплаты. Не используем VITE_ARCHIMED_API_URL.
    // Приоритет: VITE_CERTIFICATE_API_URL → VITE_API_URL (если не Archimed) → в dev '' (proxy).
    const certEnv = import.meta.env.VITE_CERTIFICATE_API_URL ?? import.meta.env.VITE_API_URL;
    const raw = typeof certEnv === 'string' ? certEnv.replace(/[\s;]+$/, '').replace(/\/+$/, '') : '';
    const isArchimed = /archimed/i.test(raw);
    // В production используем HTTPS по умолчанию, если URL не задан
    const url = raw && !isArchimed ? raw : (import.meta.env.PROD ? 'https://clinicaldan.ru/api' : '');
    this.apiUrl = url;
  }

  /**
   * Создание сертификата и получение ссылки на оплату
   */
  async createCertificate(data: CreateCertificateRequest): Promise<CreateCertificateResponse> {
    try {
      const url = this.apiUrl ? `${this.apiUrl.replace(/\/$/, '')}/certificate` : '/certificate';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating certificate:', error);
      const message = error instanceof TypeError && (error as Error).message === 'Failed to fetch'
        ? 'Сервер оплаты недоступен. Убедитесь, что бэкенд запущен или попробуйте позже.'
        : (error instanceof Error ? error.message : 'Ошибка при создании сертификата');
      throw new Error(message);
    }
  }

  /**
   * Проверка статуса платежа сертификата
   */
  async checkPaymentStatus(orderNumber: string): Promise<CheckPaymentResponse> {
    try {
      const base = this.apiUrl ? this.apiUrl.replace(/\/$/, '') : '';
      const response = await fetch(`${base}/certificate/check-payment/${orderNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  /**
   * Разделение полного имени на имя и фамилию
   */
  parseFullName(fullName: string): { firstName: string; lastName: string } {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ')
      };
    } else {
      return {
        firstName: nameParts[0] || '',
        lastName: ''
      };
    }
  }

  /**
   * Валидация email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Форматирование суммы для отображения
   */
  formatAmount(amount: number): string {
    return amount.toLocaleString('ru-RU') + ' ₽';
  }

  /**
   * Генерация уникального ID заказа
   */
  generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `cert_${timestamp}_${random}`;
  }
}

export const certificateService = new CertificateService();
export default certificateService;