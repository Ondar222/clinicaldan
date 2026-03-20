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
      description: "Свидетельство о государственной регистрации юридического лица",
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
      title: "ПРАВИЛА ВНУТРЕННЕГО РАСПОРЯДКА ДЛЯ ПАЦИЕНТОВ МЕДИЦИНСКОГО ЦЕНТРА ООО «АЛДАН»",
      description: "ПРАВИЛА ВНУТРЕННЕГО РАСПОРЯДКА ДЛЯ ПАЦИЕНТОВ МЕДИЦИНСКОГО ЦЕНТРА ООО «АЛДАН»",
      fileType: "DOCX",
      fileSize: "—",
      downloadUrl: "/documents/document1.docx",
    },
    {
      id: 7,
      title: "Порядок записи на первичный прием (консультацию, обследование)",
      description: "Порядок записи на первичный прием (консультацию, обследование)",
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
      description: "Свидетельство о государственной регистрации юридического лица",
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
      description: "Согласие на обработку персональных данных, размещенных на сайте",
      fileType: "DOCX",
      fileSize: "—",
      downloadUrl: "/documents/согласие_на_персданные_на_сайт.docx",
    },
  ];

  return (
    <div className="min-h-screen bg-lightTeal py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">Документы</h1>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <p className="text-gray-600 text-sm sm:text-base text-center mb-6 md:mb-8">
              На этой странице вы можете ознакомиться с основными документами клиники
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="flex-grow">
                    <h3 className="text-sm sm:text-base font-semibold text-dark mb-2 leading-tight line-clamp-3">
                      {doc.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 leading-relaxed line-clamp-3">
                      {doc.description}
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {doc.fileType}
                      </span>
                      <span>{doc.fileSize}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-200">
                    <a
                      href={doc.downloadUrl}
                      className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primaryDark text-white text-sm font-medium rounded-lg transition-colors w-full justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
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

            <div className="mt-6 md:mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                Для получения дополнительных документов или справок обращайтесь
                в администрацию клиники
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
