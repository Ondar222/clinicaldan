import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoUrl from "../assets/Logo.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const logoSrc = logoUrl;
  const handleLogoError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const img = e.currentTarget;
    // Prevent infinite loop if fallback is also missing
    if (img.dataset.fallbackApplied === "1") return;
    img.dataset.fallbackApplied = "1";
    img.src = "/Logo.png";
  };

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest("[data-mobile-menu]") &&
        !target.closest("[data-menu-toggle]")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        {/* Top bar */}

        {/* Main header */}
        <div className="py-2 md:py-0 flex items-center justify-between">
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="Клиника Алдан">
            <img
              src={logoSrc}
              alt="Клиника Алдан"
              className="block h-28 sm:h-32 md:h-28 lg:h-24 xl:h-28 w-auto object-contain -my-2 sm:-my-2 md:-my-2"
              loading="eager"
              onError={handleLogoError}
            />
          </Link>

          {/* Desktop navigation - один ряд на md, два ряда на lg+ */}
          <nav className="hidden md:flex md:flex-row lg:flex-col xl:flex-row gap-1 lg:gap-0 md:overflow-x-auto">
            {/* Первый ряд - основные разделы */}
            <ul className="flex flex-wrap lg:flex-nowrap gap-x-1 lg:gap-x-1">
              <li>
                <Link
                  to="/"
                  className="text-dark text-[11px] md:text-xs lg:text-[11px] xl:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-dark text-[11px] md:text-xs lg:text-[11px] xl:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  О клинике
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors"
                  className="text-dark text-[11px] md:text-xs lg:text-[11px] xl:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Врачи
                </Link>
              </li>
              <li>
                <Link
                  to="/directions"
                  className="text-dark text-[11px] md:text-xs lg:text-[11px] xl:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Направления
                </Link>
              </li>
              <li>
                <Link
                  to="/services/cosmetology"
                  className="text-dark text-[11px] md:text-xs lg:text-[11px] xl:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Косметология
                </Link>
              </li>
              <li>
                <Link
                  to="/prices"
                  className="text-dark text-[11px] md:text-xs lg:text-[11px] xl:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Прайс
                </Link>
              </li>
              <li>
                <Link
                  to="/stock"
                  className="text-dark text-[11px] md:text-xs lg:text-[11px] xl:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Акции
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-dark text-[11px] md:text-xs lg:text-[11px] xl:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Новости
                </Link>
              </li>
            </ul>
            
            {/* Второй ряд - дополнительные разделы (только на lg+) */}
            <ul className="hidden lg:flex flex-wrap gap-x-1 gap-y-1 w-full lg:w-auto">
              <li>
                <Link
                  to="/certificates"
                  className="text-dark text-[11px] lg:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Сертификаты
                </Link>
              </li>
              <li>
                <Link
                  to="/checkups"
                  className="text-dark text-[11px] lg:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Медосмотры
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className="text-dark text-[11px] lg:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Отзывы
                </Link>
              </li>
              <li>
                <Link
                  to="/questions"
                  className="text-dark text-[11px] lg:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Вопросы
                </Link>
              </li>
              <li>
                <Link
                  to="/documents"
                  className="text-dark text-[11px] lg:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Документы
                </Link>
              </li>
              <li>
                <Link
                  to="/contacts"
                  className="text-dark text-[11px] lg:text-xs hover:text-primary transition-colors whitespace-nowrap px-0.5"
                >
                  Контакты
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-dark p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            data-menu-toggle
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile navigation overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          aria-hidden="true"
        />
      )}

      {/* Mobile navigation sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden overflow-y-auto ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-mobile-menu
      >
        <div className="p-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Клиника Алдан"
          >
            <img
              src={logoSrc}
              alt="Клиника Алдан"
              className="h-48 w-auto object-contain -my-2"
              loading="eager"
              onError={handleLogoError}
            />
          </Link>
          <button
            className="text-gray-500 hover:text-dark flex-shrink-0 ml-2"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="p-3">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Главная
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                О клинике
              </Link>
            </li>
            <li>
              <Link
                to="/doctors"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Врачи
              </Link>
            </li>
            <li>
              <Link
                to="/directions"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Направления
              </Link>
            </li>
            <li>
              <Link
                to="/services/cosmetology"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Косметология
              </Link>
            </li>
            <li>
              <Link
                to="/prices"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Прайс
              </Link>
            </li>
            <li>
              <Link
                to="/stock"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Акции
              </Link>
            </li>
            <li>
              <Link
                to="/news"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Новости
              </Link>
            </li>
            <li className="pt-2 border-t border-gray-100 mt-2">
              <span className="block text-sm text-gray-500 mb-2 font-medium">Дополнительно</span>
            </li>
            <li>
              <Link
                to="/certificates"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Сертификаты
              </Link>
            </li>
            <li>
              <Link
                to="/checkups"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Медосмотры
              </Link>
            </li>
            <li>
              <Link
                to="/reviews"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Отзывы
              </Link>
            </li>
            <li>
              <Link
                to="/questions"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Вопросы
              </Link>
            </li>
            <li>
              <Link
                to="/documents"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Документы
              </Link>
            </li>
            <li>
              <Link
                to="/contacts"
                className="block py-2 text-dark text-base hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Контакты
              </Link>
            </li>
          </ul>

          {/* Временно скрыто - скрипт записи на прием
          <div className="mt-8 pt-4 border-t border-gray-100">
            <Link
              to="/appointment"
              className="block w-full bg-primary hover:bg-primaryDark text-white text-center py-3 rounded-md font-medium transition-colors"
            >
              ЗАПИСАТЬСЯ
            </Link>
          </div>
          */}
        </nav>
      </div>

      {/* Временно скрыто - скрипт записи на прием
      <div className="bg-primary hover:bg-primaryDark text-white text-center py-3 transition-colors">
        <Link to="/appointment" className="font-medium">ЗАПИСАТЬСЯ НА ПРИЕМ</Link>
      </div>
      */}
    </header>
  );
}
