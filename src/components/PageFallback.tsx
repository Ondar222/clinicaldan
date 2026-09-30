// Скелетон на время загрузки клиентской страницы.
// Без него <main> схлопывается и Footer «подпрыгивает» на экран до появления контента.
export default function PageFallback() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <div
        className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin"
        aria-label="Загрузка страницы"
        role="status"
      />
    </div>
  );
}
