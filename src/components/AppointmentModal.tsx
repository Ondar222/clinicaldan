import type React from 'react';
import { useState } from 'react';
import type { ApiService, ArchimedDoctor } from '../types/cms';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: ApiService;
  doctor?: ArchimedDoctor;
  onSuccess?: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  service,
  doctor,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    preferredDate: '',
    preferredTime: '',
    comments: '',
    agreeToSiteConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToSiteConsent) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Формируем данные в формате, который ожидает бэкенд
      const commentParts = [
        formData.comments,
        formData.preferredDate && `Желаемая дата: ${formData.preferredDate}`,
        formData.preferredTime && `Желаемое время: ${formData.preferredTime}`,
        doctor && `Врач: ${doctor.name} ${doctor.name1} ${doctor.name2}`.trim(),
        service && `Услуга: ${service.name} (${(service.cito_cost > 0 ? service.cito_cost : service.base_cost).toLocaleString('ru-RU')} ₽)`
      ].filter(Boolean);

      const appointmentData = {
        name: formData.patientName,
        phone: formData.patientPhone,
        email: formData.patientEmail || undefined,
        service: service?.name || 'Не указана',
        comment: commentParts.join('\n') || undefined
      };

      // Отправляем заявку через API бэкенда
      const response = await fetch('/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка отправки');
      }
      
      setSubmitStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setFormData({
          patientName: '',
          patientPhone: '',
          patientEmail: '',
          preferredDate: '',
          preferredTime: '',
          comments: '',
          agreeToSiteConsent: false,
        });
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Запись на прием</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {service && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Услуга</h3>
              <p className="text-gray-700">{service.name}</p>
              <p className="text-primary font-semibold mt-1">
                {(service.cito_cost > 0 ? service.cito_cost : service.base_cost).toLocaleString('ru-RU')} ₽
              </p>
            </div>
          )}

          {doctor && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Врач</h3>
              <p className="text-gray-700">
                {doctor.name} {doctor.name1} {doctor.name2}
              </p>
              <p className="text-gray-600 text-sm">{doctor.type}</p>
            </div>
          )}

          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Заявка отправлена!</h3>
              <p className="text-gray-600">Наш администратор свяжется с вами в ближайшее время</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                  ФИО *
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Введите ваше ФИО"
                />
              </div>

              <div>
                <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  id="patientPhone"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div>
                <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="patientEmail"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Предпочтительная дата
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                  />
                </div>

                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Предпочтительное время
                  </label>
                  <input
                    type="time"
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарии
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Дополнительная информация о вашем запросе"
                />
              </div>

              <div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeToSiteConsent"
                    checked={formData.agreeToSiteConsent}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        agreeToSiteConsent: e.target.checked
                      }));
                    }}
                    className={`mt-1 h-4 w-4 text-primary focus:ring-primary rounded cursor-pointer ${
                      !formData.agreeToSiteConsent && submitStatus === 'error'
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <label htmlFor="agreeToSiteConsent" className={`ml-3 text-sm cursor-pointer ${!formData.agreeToSiteConsent && submitStatus === 'error' ? 'text-red-600' : 'text-gray-700'}`}>
                    Я согласен с условиями обработки персональных данных на сайте согласно{' '}
                    <a
                      href="/documents/согласие_на_персданные_на_сайт.docx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      согласию на обработку персональных данных
                    </a>
                  </label>
                </div>
              </div>

              {submitStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm font-medium">
                    Пожалуйста, примите обязательные согласия
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Отправка...' : 'Записаться'}
                </button>
              </div>
              <div className="pt-2 text-xs text-gray-600">
                Нажимая «Записаться», вы подтверждаете согласие {' '}
                <a
                  href="/documents/utverzhdeno.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Политики защиты и обработки персональных данных
                </a>.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
