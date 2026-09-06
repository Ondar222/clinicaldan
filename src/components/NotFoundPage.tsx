import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-12 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-dark mb-4">
          Страница не найдена
        </h2>
        <p className="text-gray-600 mb-8">
          К сожалению, страница, которую вы ищете, не существует.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="inline-block bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            На главную
          </Link>
          <Link
            to="/contacts"
            className="inline-block bg-white hover:bg-gray-50 text-dark px-6 py-3 rounded-lg font-medium transition-colors border border-gray-300"
          >
            Контакты
          </Link>
        </div>
      </div>
    </div>
  );
}
