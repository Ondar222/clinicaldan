/**
 * Certificate Admin API
 * API для управления сертификатами администраторами
 */

import { Router } from 'express';

const router = Router();

// Хранилище в памяти (в production лучше использовать БД)
interface RefundRecord {
  id: string;
  operationId: string;
  certificateCode: string;
  amount: number;
  reason?: string;
  createdAt: string;
}

interface FallbackData {
  certificates: any[];
  refunds: RefundRecord[];
}

const FALLBACK_STORAGE_KEY = 'certificate_admin_fallback_data_v1';

function getFallbackData(): FallbackData {
  if (typeof global === 'undefined') return { certificates: [], refunds: [] };
  const storage = (global as any).localStorage || {};
  const raw = storage[FALLBACK_STORAGE_KEY];
  if (!raw) return { certificates: [], refunds: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { certificates: [], refunds: [] };
  }
}

function setFallbackData(data: FallbackData): void {
  if (typeof global === 'undefined') return;
  const storage = (global as any).localStorage || {};
  storage[FALLBACK_STORAGE_KEY] = JSON.stringify(data);
  (global as any).localStorage = storage;
}

// Проверка авторизации (упрощённая)
function checkAuth(req: express.Request, res: express.Response): boolean {
  // TODO: Добавить реальную проверку токена
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ statusCode: 401, message: 'Требуется авторизация' });
    return false;
  }
  return true;
}

/**
 * POST /admin/refund
 * Возврат средств на сертификат
 */
router.post('/admin/refund', (req: express.Request, res: express.Response) => {
  try {
    // Проверка авторизации
    if (!checkAuth(req, res)) return;

    const { operationId, amount, certificateCode, reason } = req.body;

    // Валидация
    if (!certificateCode) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: 'Требуется код сертификата' 
      });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: 'Сумма возврата должна быть больше 0' 
      });
    }

    const data = getFallbackData();
    const certIndex = data.certificates.findIndex((c) => c.code === certificateCode);

    if (certIndex === -1) {
      return res.status(404).json({ 
        statusCode: 404, 
        message: 'Сертификат не найден' 
      });
    }

    const cert = data.certificates[certIndex];
    const newRemaining = cert.remainingAmount + amount;

    // Обновляем сертификат
    const updatedCert = {
      ...cert,
      remainingAmount: newRemaining,
      status: newRemaining >= cert.nominalAmount ? 'active' : 'partially_used',
    };
    data.certificates[certIndex] = updatedCert;

    // Записываем возврат
    const refundRecord: RefundRecord = {
      id: `refund_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      operationId,
      certificateCode,
      amount,
      reason: reason || 'Возврат по запросу администратора',
      createdAt: new Date().toISOString(),
    };
    data.refunds.push(refundRecord);

    // Сохраняем
    setFallbackData(data);

    res.json({
      message: 'Возврат выполнен успешно',
      certificate: updatedCert,
      refundId: refundRecord.id,
    });
  } catch (error) {
    console.error('Ошибка возврата средств:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Внутренняя ошибка сервера',
    });
  }
});

/**
 * GET /admin/refunds/:certificateCode
 * История возвратов для сертификата
 */
router.get('/admin/refunds/:code', (req: express.Request, res: express.Response) => {
  try {
    const { code } = req.params;
    const data = getFallbackData();
    
    const refunds = data.refunds
      .filter((r) => r.certificateCode === code)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      data: refunds,
      total: refunds.length,
    });
  } catch (error) {
    console.error('Ошибка загрузки истории возвратов:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Внутренняя ошибка сервера',
    });
  }
});

export default router;
