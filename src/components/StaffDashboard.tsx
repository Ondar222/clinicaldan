import type React from 'react';
import { useState, useEffect } from 'react';
import type { ArchimedAppointment, ArchimedDoctor, ApiService } from '../types/cms';
import archimedService from '../services/archimed';
import type { AdminCertificate, CertificateRedeemOperation, CertificateTransactionRow, StaffDashboardResponse } from '../services/certificateAdmin';
import certificateAdminService from '../services/certificateAdmin';

const StaffDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<ArchimedAppointment[]>([]);
  const [doctors, setDoctors] = useState<ArchimedDoctor[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [transactions, setTransactions] = useState<CertificateTransactionRow[]>([]);
  const [purchasedCertificates, setPurchasedCertificates] = useState<AdminCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCertificatesLoading, setIsCertificatesLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificatesError, setCertificatesError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [certificateQuery, setCertificateQuery] = useState('');
  const [redeemValues, setRedeemValues] = useState<Record<string, string>>({});
  const [redeemReasons, setRedeemReasons] = useState<Record<string, string>>({});
  const [redeemNotifyEmail, setRedeemNotifyEmail] = useState<Record<string, boolean>>({});
  const [isRedeemingByCode, setIsRedeemingByCode] = useState<Record<string, boolean>>({});
  const [expandedHistoryByCode, setExpandedHistoryByCode] = useState<Record<string, boolean>>({});
  const [historyByCode, setHistoryByCode] = useState<Record<string, CertificateRedeemOperation[]>>({});
  const [isHistoryLoadingByCode, setIsHistoryLoadingByCode] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [appointmentsData, doctorsData, servicesData] = await Promise.all([
          archimedService.getAppointments({ page: 1, limit: 100 }),
          archimedService.getDoctors(),
          archimedService.getServices(),
        ]);

        setAppointments(appointmentsData.data);
        setDoctors(doctorsData);
        setServices(servicesData);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const loadCertificatesPanel = async (query?: string) => {
    try {
      setIsCertificatesLoading(true);
      setIsTransactionsLoading(true);
      setCertificatesError(null);
      setTransactionsError(null);

      // Загружаем сертификаты
      let certsData;
      try {
        certsData = await certificateAdminService.listCertificates({
          query: query?.trim() || undefined,
          page: 1,
          limit: 20,
          includeFailed: true,
          includeUnsuccessful: true,
        });
      } catch (certErr) {
        console.error('Ошибка загрузки списка сертификатов:', certErr);
        // Используем fallback-данные при ошибке бэкенда
        certsData = { data: [], total: 0, page: 1, limit: 20 };
        setCertificatesError(`Бэкенд недоступен: ${certErr instanceof Error ? certErr.message : 'Ошибка'}. Показаны сохранённые данные.`);
      }

      // Сортируем сертификаты по дате (новые сверху)
      const certsSorted = [...certsData.data].sort((a, b) => {
        const aTs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTs = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTs - aTs;
      });
      setCertificates(certsSorted.slice(0, 20));

      // Загружаем транзакции (игнорируем ошибки 404)
      let txRows: CertificateTransactionRow[] = [];
      try {
        txRows = await certificateAdminService.listTransactions(50);
      } catch (txErr) {
        console.warn('Список транзакций недоступен:', txErr);
        // Не показываем ошибку пользователю, просто строим из сертификатов
      }

      // Если транзакций нет, строим из сертификатов
      if (txRows.length === 0) {
        txRows = certificateAdminService.mapCertificatesToTransactionRows(certsSorted);
      }

      // Сортируем транзакции по дате (новые сверху)
      const txSorted = [...txRows].sort((a, b) => {
        const aTs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTs = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTs - aTs;
      });
      setTransactions(txSorted.slice(0, 50));

      // Все сертификаты (без фильтрации — показываем любые статусы)
      setPurchasedCertificates(certsSorted.slice(0, 50));
    } catch (err) {
      console.error('Ошибка загрузки данных панели:', err);
      setCertificatesError(err instanceof Error ? err.message : 'Не удалось загрузить данные панели.');
    } finally {
      setIsCertificatesLoading(false);
      setIsTransactionsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificatesPanel().catch((err) => {
      console.error('Ошибка начальной загрузки сертификатов:', err);
    });
  }, []);

  const getDoctorName = (doctorId?: number) => {
    if (!doctorId) return 'Неизвестный врач';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.name} ${doctor.name1} ${doctor.name2}` : 'Неизвестный врач';
  };

  const getServiceName = (serviceId?: number) => {
    if (!serviceId) return 'Неизвестная услуга';
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Неизвестная услуга';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Не указано';
    return timeString.substring(0, 5); // HH:MM format
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('ru-RU')} ₽`;
  };

  const formatDateTime = (isoDate: string) => {
    const dt = new Date(isoDate);
    if (Number.isNaN(dt.getTime())) return isoDate;
    return dt.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'partially_used':
        return 'Частично использован';
      case 'used':
        return 'Использован';
      case 'expired':
        return 'Истек';
      case 'blocked':
        return 'Заблокирован';
      default:
        return status;
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'partially_used':
        return 'bg-yellow-100 text-yellow-800';
      case 'used':
        return 'bg-gray-100 text-gray-700';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getBankStatusMeta = (status?: number | string, statusName?: string) => {
    const normalized = typeof status === 'string' ? Number.parseInt(status, 10) : status;
    if (normalized === 2) {
      return {
        label: statusName || 'Оплачен',
        className: 'bg-green-100 text-green-800',
      };
    }
    if (normalized === 0 || normalized === 1 || normalized === 5) {
      return {
        label: statusName || 'В обработке',
        className: 'bg-yellow-100 text-yellow-800',
      };
    }
    if (normalized === 3 || normalized === 4 || normalized === 6) {
      return {
        label: statusName || 'Неуспешно',
        className: 'bg-red-100 text-red-800',
      };
    }
    return {
      label: statusName || 'Неизвестно',
      className: 'bg-slate-100 text-slate-700',
    };
  };

  const handleCertificateSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadCertificatesPanel(certificateQuery);
  };

  const handleRedeem = async (certificate: AdminCertificate) => {
    const code = certificate.code;
    const value = redeemValues[code] ?? '';
    const writeOffAmount = Number.parseInt(value, 10);
    if (!Number.isFinite(writeOffAmount) || writeOffAmount <= 0) {
      setCertificatesError('Введите корректную сумму списания.');
      return;
    }
    if (writeOffAmount > certificate.remainingAmount) {
      setCertificatesError('Сумма списания не может быть больше остатка сертификата.');
      return;
    }

    try {
      setCertificatesError(null);
      setIsRedeemingByCode((prev) => ({ ...prev, [code]: true }));
      const result = await certificateAdminService.redeemCertificate({
        code,
        writeOffAmount,
        reason: redeemReasons[code] || '',
        notifyEmail: redeemNotifyEmail[code] ?? true,
      });

      setCertificates((prev) =>
        prev.map((item) => (item.code === code ? result.certificate : item))
      );
      setRedeemValues((prev) => ({ ...prev, [code]: '' }));
      setHistoryByCode((prev) => ({ ...prev, [code]: [] }));
      try {
        await loadCertificatesPanel(certificateQuery);
      } catch (reloadErr) {
        console.warn('Не удалось обновить списки после списания:', reloadErr);
      }
    } catch (err) {
      console.error('Ошибка списания сертификата:', err);
      setCertificatesError(err instanceof Error ? err.message : 'Не удалось списать сертификат.');
    } finally {
      setIsRedeemingByCode((prev) => ({ ...prev, [code]: false }));
    }
  };

  const loadCertificateHistory = async (code: string) => {
    try {
      setIsHistoryLoadingByCode((prev) => ({ ...prev, [code]: true }));
      setCertificatesError(null);
      const history = await certificateAdminService.getCertificateHistory(code);
      setHistoryByCode((prev) => ({ ...prev, [code]: history }));
    } catch (err) {
      console.error('Ошибка загрузки истории списаний:', err);
      setCertificatesError(err instanceof Error ? err.message : 'Не удалось загрузить историю списаний.');
    } finally {
      setIsHistoryLoadingByCode((prev) => ({ ...prev, [code]: false }));
    }
  };

  const toggleHistory = async (code: string) => {
    const nextExpanded = !expandedHistoryByCode[code];
    setExpandedHistoryByCode((prev) => ({ ...prev, [code]: nextExpanded }));
    if (nextExpanded && !historyByCode[code]) {
      await loadCertificateHistory(code);
    }
  };

  const handleRefund = async (operationId: string, amount: number, certificateCode: string) => {
    const confirmed = window.confirm(
      `Подтвердите возврат средств:\n\n` +
      `Сертификат: ${certificateCode}\n` +
      `Сумма возврата: ${formatCurrency(amount)}\n\n` +
      `Это увеличит остаток сертификата на указанную сумму.`
    );
    
    if (!confirmed) return;

    try {
      setCertificatesError(null);
      
      // Вызов API возврата
      const result = await certificateAdminService.refundCertificate({
        operationId,
        amount,
        certificateCode,
        reason: 'Возврат по запросу администратора',
      });
      
      // Обновляем данные из ответа API
      setCertificates((prev) =>
        prev.map((cert) =>
          cert.code === certificateCode ? result.certificate : cert
        )
      );
      
      setPurchasedCertificates((prev) =>
        prev.map((cert) =>
          cert.code === certificateCode ? result.certificate : cert
        )
      );
      
      // Обновляем историю
      await loadCertificateHistory(certificateCode);
      
      alert(`Средства успешно возвращены: ${formatCurrency(amount)}`);
    } catch (err) {
      console.error('Ошибка возврата средств:', err);
      setCertificatesError(err instanceof Error ? err.message : 'Не удалось вернуть средства.');
    }
  };

  /**
   * Проверяет, доступен ли сертификат для списания.
   * Кнопка "Списать сумму" доступна если:
   * - Сертификат НЕ имеет статус "used" (полностью использован)
   * - ИЛИ remainingAmount > 0 (есть остаток)
   * - ИЛИ payment.bankStatus = 2 (оплачен)
   */
  const isRedeemable = (certificate: AdminCertificate): boolean => {
    // Если статус "used" - сертификат полностью использован, списать нельзя
    if (certificate.status === 'used') return false;
    
    // Если есть остаток - можно списывать
    if (certificate.remainingAmount > 0) return true;
    
    // Если сертификат оплачен (bankStatus = 2) но remainingAmount = 0,
    // это может быть баг бэкенда - всё равно разрешаем списание
    const bankStatus = certificate.payment?.bankStatus;
    const normalizedBankStatus = typeof bankStatus === 'string' 
      ? Number.parseInt(bankStatus, 10) 
      : bankStatus;
    if (normalizedBankStatus === 2) return true; // оплачен
    
    // Для всех остальных случаев используем remainingAmount
    return certificate.remainingAmount > 0;
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (!selectedDate) return true;
    if (!appointment.preferred_date) return false;
    const appointmentDate = new Date(appointment.preferred_date).toISOString().split('T')[0];
    return appointmentDate === selectedDate;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primaryDark transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-4">Панель сотрудника</h1>
          <p className="text-lg text-gray-600">Управление записями пациентов</p>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <label htmlFor="date-filter" className="text-sm font-medium text-gray-700">
              Фильтр по дате:
            </label>
            <input
              id="date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-primary text-white">
            <h2 className="text-xl font-semibold">
              Записи на {formatDate(selectedDate)} ({filteredAppointments.length})
            </h2>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">На выбранную дату записей нет</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-dark">
                          {appointment.patient_name}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          ID: {appointment.id}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Врач:</span> {getDoctorName(appointment.doctor_id)}
                        </div>
                        <div>
                          <span className="font-medium">Услуга:</span> {getServiceName(appointment.service_id)}
                        </div>
                        <div>
                          <span className="font-medium">Дата:</span> {formatDate(appointment.preferred_date)}
                        </div>
                        <div>
                          <span className="font-medium">Время:</span> {formatTime(appointment.preferred_time)}
                        </div>
                        <div>
                          <span className="font-medium">Телефон:</span> {appointment.patient_phone}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {appointment.patient_email}
                        </div>
                      </div>

                      {appointment.comments && (
                        <div className="mt-3">
                          <span className="font-medium text-gray-700">Комментарии:</span>
                          <p className="text-gray-600 mt-1">{appointment.comments}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Handle appointment update
                            console.log('Update appointment:', appointment.id);
                          }}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => {
                            // Handle appointment cancellation
                            console.log('Cancel appointment:', appointment.id);
                          }}
                          className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Отменить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Транзакции оплаты (как в кабинете банка) */}
        <div className="mt-10 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-primary text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold">Транзакции оплаты сертификатов</h2>
            <button
              onClick={() => {
                loadCertificatesPanel(certificateQuery).catch((err) => {
                  console.error('Ошибка обновления:', err);
                });
              }}
              className="px-4 py-2 text-sm bg-white text-primary rounded hover:bg-gray-100 transition-colors"
            >
              Обновить
            </button>
          </div>
          <p className="px-6 py-3 text-sm text-gray-600 border-b border-gray-200">
            Последние операции: успешные и отклонённые. Если на бэкенде нет отдельного списка, строки строятся из данных оплаты в списке купленных сертификатов ниже.
          </p>
          {transactionsError && (
            <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
              {transactionsError}
            </div>
          )}
          {isTransactionsLoading ? (
            <div className="p-8 text-center text-gray-600">Загрузка транзакций...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Транзакций пока нет</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Сумма</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Статус</th>
                    <th className="px-4 py-3 font-semibold min-w-[200px]">Код ответа</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Номер заказа</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Платёжное средство</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Сертификат</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((row) => {
                    const bankMeta = getBankStatusMeta(row.bankStatus, row.responseCode);
                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {formatCurrency(row.amount)} {row.currency && row.currency !== 'RUR' ? row.currency : ''}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${bankMeta.className}`}>
                            {row.statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{row.responseCode || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-primary break-all max-w-[200px]">
                          {row.orderId || row.paymentOrderId || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{row.paymentMethod || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{row.certificateCode || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {row.createdAt ? formatDateTime(row.createdAt) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Купленные сертификаты (успешно оплаченные) */}
        <div className="mt-10 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-primary text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold">Все сертификаты</h2>
            <div className="flex gap-2">
              <span className="text-sm text-white/90">
                Всего: {purchasedCertificates.length}
              </span>
              <button
                onClick={() => {
                  loadCertificatesPanel(certificateQuery).catch((err) => {
                    console.error('Ошибка обновления сертификатов:', err);
                  });
                }}
                className="px-4 py-2 text-sm bg-white text-primary rounded hover:bg-gray-100 transition-colors"
              >
                Обновить
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleCertificateSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={certificateQuery}
                onChange={(e) => setCertificateQuery(e.target.value)}
                placeholder="Поиск по номеру сертификата"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition-colors"
              >
                Найти
              </button>
            </form>
            <p className="mt-2 text-sm text-gray-500">
              Показаны все сертификаты (любой статус). Можно отфильтровать по номеру, например <span className="font-mono">CERT-2026-0001</span>.
            </p>
          </div>

          {certificatesError && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {certificatesError}
            </div>
          )}

          {isCertificatesLoading ? (
            <div className="p-8 text-center text-gray-600">Загрузка сертификатов...</div>
          ) : purchasedCertificates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Оплаченных сертификатов не найдено</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {purchasedCertificates.map((certificate) => (
                <div key={certificate.code} className="p-6">
                  {(() => {
                    const bankMeta = getBankStatusMeta(
                      certificate.payment?.bankStatus,
                      certificate.payment?.bankStatusName
                    );
                    return (
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-dark">№ {certificate.code}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClassName(certificate.status)}`}>
                          {getStatusLabel(certificate.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${bankMeta.className}`}>
                          Банк: {bankMeta.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                        <p><span className="font-medium">Номинал:</span> {formatCurrency(certificate.nominalAmount)}</p>
                        <p><span className="font-medium">Остаток:</span> {formatCurrency(certificate.remainingAmount)}</p>
                        <p><span className="font-medium">Клиент:</span> {certificate.customerName || 'Не указан'}</p>
                        <p><span className="font-medium">Телефон:</span> {certificate.customerPhone || 'Не указан'}</p>
                        <p><span className="font-medium">Email:</span> {certificate.customerEmail || 'Не указан'}</p>
                        <p><span className="font-medium">Order ID:</span> {certificate.payment?.orderId || '—'}</p>
                        <p><span className="font-medium">Payment order ID:</span> {certificate.payment?.paymentOrderId || '—'}</p>
                        <p><span className="font-medium">Локальный статус:</span> {certificate.payment?.localStatus ?? '—'}</p>
                        <p><span className="font-medium">Статус банка:</span> {certificate.payment?.bankStatus ?? '—'} {certificate.payment?.bankStatusName ? `(${certificate.payment.bankStatusName})` : ''}</p>
                      </div>
                      {certificate.payment?.formUrl && (
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Ссылка на оплату:</span>{' '}
                          <a
                            href={certificate.payment.formUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all"
                          >
                            Открыть форму оплаты
                          </a>
                        </p>
                      )}
                    </div>

                    <div className="w-full lg:w-[360px] space-y-3">
                      <input
                        type="number"
                        min={1}
                        max={certificate.remainingAmount}
                        step={1}
                        value={redeemValues[certificate.code] ?? ''}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          setRedeemValues((prev) => ({ ...prev, [certificate.code]: nextValue }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Сумма списания"
                      />
                      <input
                        type="text"
                        value={redeemReasons[certificate.code] ?? ''}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          setRedeemReasons((prev) => ({ ...prev, [certificate.code]: nextValue }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Комментарий (услуга, причина)"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={redeemNotifyEmail[certificate.code] ?? true}
                          onChange={(e) => {
                            setRedeemNotifyEmail((prev) => ({ ...prev, [certificate.code]: e.target.checked }));
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary rounded border-gray-300"
                        />
                        Уведомить клиента по email
                      </label>
                      <button
                        onClick={() => {
                          handleRedeem(certificate).catch((err) => {
                            console.error('Ошибка при обработке списания:', err);
                          });
                        }}
                        disabled={isRedeemingByCode[certificate.code] || !isRedeemable(certificate)}
                        className={`w-full px-4 py-2 rounded-md text-white transition-colors ${
                          isRedeemingByCode[certificate.code] || !isRedeemable(certificate)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-primaryDark'
                        }`}
                      >
                        {isRedeemingByCode[certificate.code] ? 'Списание...' : 'Списать сумму'}
                      </button>
                      <button
                        onClick={() => {
                          toggleHistory(certificate.code).catch((err) => {
                            console.error('Ошибка открытия истории:', err);
                          });
                        }}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {expandedHistoryByCode[certificate.code] ? 'Скрыть историю списаний' : 'Показать историю списаний'}
                      </button>
                    </div>
                  </div>
                    );
                  })()}

                  {expandedHistoryByCode[certificate.code] && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">История списаний</h4>
                      {isHistoryLoadingByCode[certificate.code] ? (
                        <p className="text-sm text-gray-500">Загрузка истории...</p>
                      ) : (historyByCode[certificate.code] ?? []).length === 0 ? (
                        <p className="text-sm text-gray-500">Списаний пока нет.</p>
                      ) : (
                        <div className="space-y-2">
                          {(historyByCode[certificate.code] ?? []).map((operation) => (
                            <div key={operation.id} className="p-3 rounded-md bg-gray-50 text-sm text-gray-700">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <p>
                                  <span className="font-medium">Списано:</span> {formatCurrency(operation.writeOffAmount)}
                                  {' '}| <span className="font-medium">Остаток после:</span> {formatCurrency(operation.remainingAmountAfter)}
                                </p>
                                <p className="text-gray-500">{formatDateTime(operation.createdAt)}</p>
                              </div>
                              <p className="mt-1">
                                <span className="font-medium">Причина/услуга:</span>{' '}
                                {operation.reason || operation.serviceName || 'Не указано'}
                              </p>
                              <p className="mt-1">
                                <span className="font-medium">Администратор:</span> {operation.adminName || 'Не указан'}
                              </p>
                              <button
                                onClick={() => {
                                  handleRefund(operation.id, operation.writeOffAmount, certificate.code).catch((err) => {
                                    console.error('Ошибка при обработке возврата:', err);
                                  });
                                }}
                                className="mt-2 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                              >
                                Возврат {formatCurrency(operation.writeOffAmount)}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
