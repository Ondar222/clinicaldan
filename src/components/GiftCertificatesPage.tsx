import type React from "react";
import { useState } from "react";
import certificateService, { type CreateCertificateRequest, type Customer } from "../services/certificates";

interface CertificateForm {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  amount: number;
  message: string;
  agreeToSiteConsent: boolean;
}

export default function GiftCertificatesPage() {
  const [formData, setFormData] = useState<CertificateForm>({
    recipientName: "",
    recipientEmail: "",
    senderName: "",
    senderEmail: "",
    amount: 1000,
    message: "",
    agreeToSiteConsent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [useCustomAmount, setUseCustomAmount] = useState(false);

  // Определяем текущую среду
  const isProduction = import.meta.env.PROD || false;

  // Функция валидации email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount"
        ? Number.isNaN(Number.parseInt(value)) ? prev.amount : Number.parseInt(value)
        : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value),
    }));

    // Очищаем ошибку поля при изменении
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Валидация формы перед отправкой
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const fieldErrors: { [key: string]: string } = {};

    // Проверка суммы сертификата
    const minAmount = 1000;
    const maxAmount = 50000;
    if (!formData.amount || Number.isNaN(formData.amount)) {
      errors.push("Укажите сумму сертификата");
    } else if (formData.amount < minAmount || formData.amount > maxAmount) {
      errors.push(`Сумма должна быть от ${minAmount.toLocaleString('ru-RU')} до ${maxAmount.toLocaleString('ru-RU')} ₽`);
    }

    if (!formData.recipientName.trim()) {
      errors.push("Имя получателя обязательно");
      fieldErrors.recipientName = "Имя получателя обязательно";
    } else {
      const recipientNameParts = formData.recipientName.trim().split(' ');
      if (recipientNameParts.length < 2 || !recipientNameParts[1].trim()) {
        errors.push("Укажите имя и фамилию получателя");
        fieldErrors.recipientName = "Укажите имя и фамилию получателя";
      }
    }

    if (!formData.recipientEmail.trim()) {
      errors.push("Email получателя обязателен");
      fieldErrors.recipientEmail = "Email получателя обязателен";
    } else if (!validateEmail(formData.recipientEmail)) {
      errors.push("Email получателя имеет неверный формат");
      fieldErrors.recipientEmail = "Email получателя имеет неверный формат";
    }

    if (!formData.senderName.trim()) {
      errors.push("Ваше имя обязательно");
      fieldErrors.senderName = "Ваше имя обязательно";
    } else {
      const senderNameParts = formData.senderName.trim().split(' ');
      if (senderNameParts.length < 2 || !senderNameParts[1].trim()) {
        errors.push("Укажите ваше имя и фамилию");
        fieldErrors.senderName = "Укажите ваше имя и фамилию";
      }
    }

    if (!formData.senderEmail.trim()) {
      errors.push("Ваш email обязателен");
      fieldErrors.senderEmail = "Ваш email обязателен";
    } else if (!validateEmail(formData.senderEmail)) {
      errors.push("Ваш email имеет неверный формат");
      fieldErrors.senderEmail = "Ваш email имеет неверный формат";
    }

    setFieldErrors(fieldErrors);
    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация формы
    const validation = validateForm();
    if (!validation.isValid || !formData.agreeToSiteConsent) {
      setError(validation.errors.join(", "));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Подготовка данных клиента (получателя)
      const customerName = certificateService.parseFullName(formData.recipientName);
      const customer: Customer = {
        firstName: customerName.firstName,
        lastName: customerName.lastName,
        email: formData.recipientEmail,
      };

      // Подготовка данных спонсора (отправителя) - если это подарочный сертификат
      let sponsor: Customer | undefined;
      const isSelfCertificate = formData.senderEmail === formData.recipientEmail && 
                               formData.senderName === formData.recipientName;
      
      if (!isSelfCertificate) {
        const sponsorName = certificateService.parseFullName(formData.senderName);
        sponsor = {
          firstName: sponsorName.firstName,
          lastName: sponsorName.lastName,
          email: formData.senderEmail,
        };
      }

      const amount = Number(formData.amount);
      if (!Number.isFinite(amount) || amount < 1000 || amount > 50000) {
        setError("Укажите корректную сумму сертификата (1 000 – 50 000 ₽).");
        setIsSubmitting(false);
        return;
      }

      const requestData: CreateCertificateRequest = {
        amount,
        customer: {
          firstName: customer.firstName.trim() || '—',
          lastName: customer.lastName.trim() || '—',
          email: customer.email.trim(),
          ...(customer.phone ? { phone: customer.phone } : {}),
        },
        ...(sponsor ? {
          sponsor: {
            firstName: sponsor.firstName.trim() || '—',
            lastName: sponsor.lastName.trim() || '—',
            email: sponsor.email.trim(),
            ...(sponsor.phone ? { phone: sponsor.phone } : {}),
          },
        } : {}),
        greetingText: formData.message?.trim() || undefined,
      };

      // Отправка запроса на создание сертификата
      const response = await certificateService.createCertificate(requestData);

      // Перенаправление на страницу оплаты
      window.location.href = response.paymentUrl;
    } catch (error) {
      console.error("Ошибка при оформлении сертификата:", error);
      const errorMessage = error instanceof Error ? error.message : "Произошла ошибка при создании платежа";
      setError(errorMessage + ". Попробуйте еще раз.");
      setIsSubmitting(false);
    }
  };

  const certificateAmounts = [
    { value: 1000, label: "1 000 ₽" },
    { value: 2000, label: "2 000 ₽" },
    { value: 3000, label: "3 000 ₽" },
    { value: 5000, label: "5 000 ₽" },
    { value: 10000, label: "10 000 ₽" },
    { value: 15000, label: "15 000 ₽" },
    { value: 20000, label: "20 000 ₽" },
    { value: 30000, label: "30 000 ₽" },
    { value: 40000, label: "40 000 ₽" },
    { value: 50000, label: "50 000 ₽" },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark mb-4">
              Сертификат успешно оформлен!
            </h2>
            <p className="text-gray-600 mb-6">
              Электронный сертификат отправлен на указанный email адрес.
              Получатель сможет воспользоваться сертификатом в течение 3
              месяцев.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Оформить еще один сертификат
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark mb-3 md:mb-4">
            Подарочные сертификаты
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Не знаете какой подарок преподнести? Подарочный сертификат на услуги
            клиники - идеальный выбор для любого торжества!
          </p>

          {/* Индикатор среды */}
          {/* {!isProduction && (
            <div className="mt-4 inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
              <span className="font-medium">🧪 ТЕСТОВАЯ СРЕДА</span>
              <span className="text-sm ml-2">(платежи не списываются)</span>
            </div>
          )} */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column - Benefits */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-dark mb-4 md:mb-6">
                Преимущества сертификата
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Оплачивается целый комплекс услуг
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Использование в течение 3 месяцев
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Красивый и стильный подарок
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">Покупка на любую сумму</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">Электронный сертификат</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-dark mb-3 md:mb-4">
                Как это работает
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-dark">
                      Выберите сумму сертификата
                    </h4>
                    <p className="text-sm text-gray-600">
                      От 1 000 до 50 000 рублей
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-dark">Заполните форму</h4>
                    <p className="text-sm text-gray-600">
                      Укажите данные получателя и отправителя
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-dark">
                      Оплатите сертификат
                    </h4>
                    <p className="text-sm text-gray-600">
                      Безопасная оплата онлайн
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-dark">
                      Получите сертификат
                    </h4>
                    <p className="text-sm text-gray-600">
                      Электронный сертификат на email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-dark mb-4 md:mb-6">
              Оформить сертификат
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  Сумма сертификата
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {certificateAmounts.map((amount) => (
                    <button
                      key={amount.value}
                      type="button"
                      onClick={() => {
                        setUseCustomAmount(false);
                        setFormData((prev) => ({
                          ...prev,
                          amount: amount.value,
                        }));
                      }}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        !useCustomAmount && formData.amount === amount.value
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      {amount.label}
                    </button>
                  ))}
                </div>

                {/* Другая сумма */}
                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={useCustomAmount}
                      onChange={(e) => setUseCustomAmount(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary rounded border-gray-300"
                    />
                    Другая сумма
                  </label>
                  {useCustomAmount && (
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1000}
                        max={50000}
                        step={100}
                        value={formData.amount || 1000}
                        onChange={(e) => {
                          const next = Number.parseInt(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            amount: Number.isNaN(next) ? prev.amount : next,
                          }));
                        }}
                        className="w-40 px-4 py-2 border rounded focus:outline-none focus:border-primary border-gray-300"
                        placeholder="Напр.: 7000"
                      />
                      <span className="text-sm text-gray-500">₽ (от 1 000 до 50 000)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Information */}
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-dark">
                  Данные получателя
                </h3>
                <div>
                  <label
                    htmlFor="recipientName"
                    className="block text-gray-700 mb-2"
                  >
                    Имя и фамилия получателя *
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Например: Иван Иванов"
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-primary ${
                      fieldErrors.recipientName
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {fieldErrors.recipientName && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldErrors.recipientName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="recipientEmail"
                    className="block text-gray-700 mb-2"
                  >
                    Email получателя *
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    name="recipientEmail"
                    value={formData.recipientEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-primary ${
                      fieldErrors.recipientEmail
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {fieldErrors.recipientEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldErrors.recipientEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Sender Information */}
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-dark">
                  Данные отправителя
                </h3>
                <div>
                  <label
                    htmlFor="senderName"
                    className="block text-gray-700 mb-2"
                  >
                    Ваше имя и фамилия *
                  </label>
                  <input
                    type="text"
                    id="senderName"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleChange}
                    placeholder="Например: Петр Петров"
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-primary ${
                      fieldErrors.senderName
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {fieldErrors.senderName && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldErrors.senderName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="senderEmail"
                    className="block text-gray-700 mb-2"
                  >
                    Ваш email *
                  </label>
                  <input
                    type="email"
                    id="senderEmail"
                    name="senderEmail"
                    value={formData.senderEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-primary ${
                      fieldErrors.senderEmail
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {fieldErrors.senderEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldErrors.senderEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">
                  Поздравительное сообщение
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                  placeholder="Напишите поздравление для получателя..."
                />
              </div>

              <div>
                <label className={`flex items-start space-x-3 ${!formData.agreeToSiteConsent && error ? 'text-red-600' : ''}`}>
                  <input
                    type="checkbox"
                    name="agreeToSiteConsent"
                    checked={formData.agreeToSiteConsent}
                    onChange={handleChange}
                    className={`mt-1 h-4 w-4 text-primary focus:ring-primary rounded ${
                      !formData.agreeToSiteConsent && error
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  <span className="text-sm text-gray-700">
                    Я согласен с условиями обработки персональных данных на сайте согласно{' '}
                    <a
                      href="/documents/согласие_на_персданные_на_сайт.docx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                     согласию на обработку персональных данных
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-primary hover:bg-primaryDark text-white py-3 px-6 rounded-md font-medium transition-colors ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting
                  ? "Обработка..."
                  : `Оплатить ${certificateService.formatAmount(formData.amount)}`}
              </button>
            </form>

            <div className="mt-4 text-sm text-gray-600">
              Оформляя сертификат, вы подтверждаете согласие с{' '}
              <a
                href="/documents/utverzhdeno.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
             Политики защиты и обработки персональных данных
              </a>.
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Важно:</strong> Сертификат будет отправлен на email
                получателя. Проверьте папку "СПАМ", если не получили письмо.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
