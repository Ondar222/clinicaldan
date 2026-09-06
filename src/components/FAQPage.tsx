import React, { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    "all",
    "Общие вопросы",
    "Запись на прием",
    "Услуги и цены",
    "Страхование",
    "Подготовка к приему",
    "После приема",
  ];

  const faqItems: FAQItem[] = [
    {
      id: 1,
      category: "Общие вопросы",
      question: "Каковы часы работы клиники?",
      answer:
        "Наша клиника работает с понедельника по пятницу с 08:00 до 22:00, в субботу с 9:00 до 18:00. Воскресенье - выходной день.",
    },
    {
      id: 2,
      category: "Общие вопросы",
      question: "Где находится клиника?",
      answer: "Клиника расположена по адресу: г. Кызыл, ул. Ленина д.60. ",
    },
    {
      id: 3,
      category: "Запись на прием",
      question: "Как записаться на прием?",
      answer:
        "Вы можете записаться на прием несколькими способами:\n1. Позвонить по телефону +7 (923) 317-60-60\n2. Через форму записи на нашем сайте\n3. Лично в регистратуре клиники",
    },
    {
      id: 4,
      category: "Запись на прием",
      question: "Можно ли записаться на прием онлайн?",
      answer:
        "Да, на нашем сайте доступна онлайн-запись. Вы можете выбрать удобное время и специалиста, заполнить необходимые данные и получить подтверждение записи.",
    },
    {
      id: 5,
      category: "Услуги и цены",
      question: "Какие виды медицинской помощи оказываются в клинике?",
      answer:
        "Мы предоставляем широкий спектр медицинских услуг:\n- Терапия\n- Кардиология\n- Неврология\n- Офтальмология\n- Стоматология\n- Дерматология\n- Гинекология\n- Урология\n- Эндокринология\n- Педиатрия",
    },
    {
      id: 6,
      category: "Услуги и цены",
      question: "Как узнать стоимость услуг?",
      answer:
        'Актуальные цены на все услуги доступны на нашем сайте в разделе "Услуги и цены". Также вы можете уточнить стоимость конкретной услуги по телефону.',
    },
    {
      id: 7,
      category: "Страхование",
      question: "Работаете ли вы с медицинскими страховыми компаниями?",
      answer:
        "Да, мы сотрудничаем с большинством ведущих страховых компаний. При посещении клиники необходимо иметь при себе полис ДМС и паспорт.",
    },
    {
      id: 8,
      category: "Страхование",
      question:
        "Какие документы нужны для получения медицинской помощи по страховке?",
      answer:
        "Для получения медицинской помощи по страховке необходимо предоставить:\n1. Паспорт\n2. Полис ДМС\n3. Направление от страховой компании (если требуется)",
    },
    {
      id: 9,
      category: "Подготовка к приему",
      question: "Нужно ли готовиться к приему у врача?",
      answer:
        "Да, для некоторых видов обследований требуется специальная подготовка. Например:\n- Анализ крови - натощак\n- УЗИ брюшной полости - натощак\n- Колоноскопия - специальная диета\nПодробные инструкции вы получите при записи на прием.",
    },
    {
      id: 10,
      category: "Подготовка к приему",
      question: "Что взять с собой на прием?",
      answer:
        "Рекомендуем взять с собой:\n1. Паспорт\n2. Медицинский полис (если есть)\n3. Результаты предыдущих обследований\n4. Список принимаемых лекарств\n5. Медицинскую карту (если есть)",
    },
    {
      id: 11,
      category: "После приема",
      question: "Как получить результаты анализов?",
      answer:
        "Результаты анализов можно получить:\n1. Лично в клинике\n2. По электронной почте\n3. В личном кабинете на нашем сайте\nСроки готовности анализов зависят от их вида и обычно составляют от 1 до 7 дней.",
    },
    {
      id: 12,
      category: "После приема",
      question: "Что делать, если после приема остались вопросы?",
      answer:
        "Если у вас остались вопросы после приема, вы можете:\n1. Позвонить в клинику и задать вопрос администратору\n2. Написать врачу через личный кабинет\n3. Записаться на повторную консультацию",
    },
  ];

  const filteredFAQ = faqItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">
          Часто задаваемые вопросы
        </h1>

        {/* Search and filter section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Поиск по вопросам и ответам..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "Все категории" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FAQ items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQ.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden min-h-[120px] flex flex-col"
            >
              <div className="p-5 md:p-6 flex flex-col flex-grow">
                <div className="flex items-center mb-3">
                  <span className="bg-teal/10 text-teal px-3 py-1 rounded-full text-sm font-medium">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 leading-tight text-gray-900">
                  {item.question}
                </h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed flex-grow">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredFAQ.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">По вашему запросу ничего не найдено</p>
          </div>
        )}

        {/* Contact section */}
        <div className="max-w-4xl mx-auto mt-10 md:mt-12 bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4">
            Не нашли ответ на свой вопрос?
          </h2>
          <p className="text-gray-600 mb-4">
            Свяжитесь с нами, и мы с радостью ответим на все ваши вопросы.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <button className="bg-teal text-white px-6 py-2 rounded-md hover:bg-teal/90 transition-colors">
              Написать нам
            </button>
            <button className="border border-teal text-teal px-6 py-2 rounded-md hover:bg-teal/10 transition-colors">
              Позвонить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
