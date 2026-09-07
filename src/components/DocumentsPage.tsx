import React from "react";

export default function DocumentsPage() {
  const documents = [
    {
      id: 1,
      title: "Лицензия на медицинскую деятельность",
      description: "Лицензия на осуществление медицинской деятельности",
      fileType: "PDF",
      fileSize: "—",
      downloadUrl: "/documents/document3.pdf",
    },
    {
      id: 2,
      title: "Свидетельство о государственной регистрации",
      description:
        "Свидетельство о государственной регистрации юридического лица",
      fileType: "JPG",
      fileSize: "—",
      downloadUrl: "/documents/document4.jpg",
    },
    {
      id: 3,
      title: "Порядок записи",
      description: "Порядок записи",
      fileType: "DOC",
      fileSize: "—",
      downloadUrl: "/documents/document5.doc",
    },
    {
      id: 4,
      title: "Правила внутреннего распорядка",
      description: "Правила внутреннего трудового распорядка",
      fileType: "DOCX",
      fileSize: "—",
      downloadUrl: "/documents/document1.docx",
    },
    {
      id: 5,
      title: "Договор оказания платных медицинских услуг",
      description: "Правила оказания платных медицинских услуг",
      fileType: "DOC",
      fileSize: "—",
      downloadUrl: "/documents/document2.docx",
    },
    {
      id: 6,
      title:
        "ПРАВИЛА ВНУТРЕННЕГО РАСПОРЯДКА ДЛЯ ПАЦИЕНТОВ МЕДИЦИНСКОГО ЦЕНТРА ООО «АЛДАН»",
      description:
        "ПРАВИЛА ВНУТРЕННЕГО РАСПОРЯДКА ДЛЯ ПАЦИЕНТОВ МЕДИЦИНСКОГО ЦЕНТРА ООО «АЛДАН»",
      fileType: "DOCX",
      fileSize: "—",
      downloadUrl: "/documents/document1.docx",
    },
    {
      id: 7,
      title: "Порядок записи на первичный прием (консультацию, обследование)",
      description:
        "Порядок записи на первичный прием (консультацию, обследование)",
      fileType: "DOCX",
      fileSize: "—",
      downloadUrl: "/documents/document2.docx",
    },
    {
      id: 8,
      title: "Выписка из реестра",
      description: "Выписка из реестра",
      fileType: "PDF",
      fileSize: "—",
      downloadUrl: "/documents/document3.pdf",
    },
    {
      id: 9,
      title: "Свидетельство о государственной регистрации юридического лица",
      description:
        "Свидетельство о государственной регистрации юридического лица",
      fileType: "JPG",
      fileSize: "—",
      downloadUrl: "/documents/document4.jpg",
    },
    {
      id: 10,
      title: "Договор оказания платных медицинских услуг № ___",
      description: "Договор оказания платных медицинских услуг № ___",
      fileType: "DOC",
      fileSize: "—",
      downloadUrl: "/documents/document5.doc",
    },
    {
      id: 11,
      title: "Политика конфиденциальности",
      description: "Политика конфиденциальности клиники",
      fileType: "PDF",
      fileSize: "—",
      downloadUrl: "/documents/utverzhdeno.pdf",
    },
    {
      id: 12,
      title: "Согласие на обработку персональных данных на сайте",
      description:
        "Согласие на обработку персональных данных, размещенных на сайте",
      fileType: "DOCX",
      fileSize: "—",
      downloadUrl: "/documents/согласие_на_персданные_на_сайт.docx",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] overflow-hidden">
      {/* Мягкие декоративные пятна */}
      <div className="fixed -left-20 top-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -right-10 bottom-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section
        className="py-10 sm:py-14 md:py-18 lg:py-20 bg-cover bg-center relative"
        style={{ backgroundImage: "url(/bg_8.avif)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            Документы
          </h1>
          <p className="text-white/90 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Лицензии, свидетельства и другие документы клиники Алдан
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-10 md:py-12">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-primary/10 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex-grow p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {doc.fileType}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-dark mb-2 leading-tight line-clamp-3">
                    {doc.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {doc.description}
                  </p>
                </div>

                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-primary/10 mt-auto">
                  <a
                    href={doc.downloadUrl}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-xl hover:bg-primary hover:text-white transition-all w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Скачать
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/10">
            <p className="text-sm text-gray-600 text-center">
              Для получения дополнительных документов или справок обращайтесь в
              администрацию клиники
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
