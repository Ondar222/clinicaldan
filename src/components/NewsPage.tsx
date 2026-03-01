import VkNewsWidget from "./VkNewsWidget";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-lightTeal py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          {/* <div className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Новости клиники
            </h1>
            <p className="text-gray-600 mb-6">
              Следите за актуальными новостями, акциями и событиями клиники Алдан
            </p>
            <a
              href="https://vk.com/clinicaaldan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0077FF] hover:bg-[#0066DD] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.785 16.241s.327-.039.495-.238c.185-.22.179-.51.179-.51s-.026-3.75 1.676-4.304c1.707-.563 3.9 3.95 6.226 5.696 1.773 1.316 3.115 1.028 3.115 1.028l6.22-.09s3.25-.203 1.71-2.77c-.128-.21-.91-1.88-4.687-5.316-3.966-3.62-3.436-3.036 1.344-9.304.923-1.2.647-1.82-.614-1.82h-6.63s-.49-.035-.855.22c-.298.2-.49.65-.49.65s-.881 2.35-2.054 4.35c-2.476 4.2-3.468 4.95-3.872 4.66-.95-.57-.712-2.3-.712-3.53 0-3.84.558-5.44-1.088-5.86-.275-.07-.477-.12-1.182-.127-.865-.01-1.525.003-1.92.207-.264.135-.475.435-.35.453.155.022.505.097.69.355.24.33.23 1.07.23 1.07s1.38 8.08 3.23 12.15c1.5 3.22 2.23 4.22 3.48 4.22h.84s.99.07 1.19-.64c.09-.36.09-.78.09-1.28 0-2.5.18-3.55.81-3.9.4-.22 1.15-.15 1.9.11.5.18.87.3.96.47.14.24.1.78.1 1.2-.01.8.14 1.13.32 1.3.22.21.48.14.48.14z"/>
              </svg>
              Подписаться на новости ВКонтакте
            </a>
          </div> */}

          {/* VK Posts */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-4 md:p-6">
            <VkNewsWidget count={50} itemsPerPage={6} />
          </div>
        </div>
      </div>
    </div>
  );
}

