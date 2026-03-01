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
              className="block h-32 sm:h-36 md:h-32 lg:h-28 xl:h-32 w-auto object-contain -my-2 sm:-my-2 md:-my-2"
              loading="eager"
              onError={handleLogoError}
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex flex-shrink-0 overflow-hidden">
            <ul className="flex space-x-1 lg:space-x-2 xl:space-x-3">
              <li>
                <Link
                  to="/"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  О клинике
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  Врачи
                </Link>
              </li>
              <li>
                <Link
                  to="/prices"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  Прайс-лист
                </Link>
              </li>
              <li>
                <Link
                  to="/stock"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  Акции
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  Новости
                </Link>
              </li>
              <li>
                <Link
                  to="/certificates"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  Сертификаты
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  Отзывы
                </Link>
              </li>
              <li>
                <Link
                  to="/questions"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  Вопросы
                </Link>
              </li>
              <li>
                <Link
                  to="/documents"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                >
                  Документы
                </Link>
              </li>
              {user && user.role === 'staff' && (
                <li>
                  <Link
                    to="/staff"
                    className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
                  >
                    Панель сотрудника
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/contacts"
                  className="text-dark text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap"
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
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Главная
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                О клинике
              </Link>
            </li>
            <li>
              <Link
                to="/doctors"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Врачи
              </Link>
            </li>
            <li>
              <Link
                to="/prices"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Прайс-лист
              </Link>
            </li>
            <li>
              <Link
                to="/stock"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Акции
              </Link>
            </li>
            <li>
              <Link
                to="/news"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Новости
              </Link>
            </li>
            <li>
              <Link
                to="/certificates"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Сертификаты
              </Link>
            </li>
            <li>
              <Link
                to="/reviews"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Отзывы
              </Link>
            </li>
            <li>
              <Link
                to="/questions"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Вопросы
              </Link>
            </li>
            <li>
              <Link
                to="/documents"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Документы
              </Link>
            </li>
            {user && user.role === 'staff' && (
              <li>
                <Link
                  to="/staff"
                  className="block py-2 text-dark text-sm hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Панель сотрудника
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/contacts"
                className="block py-2 text-dark text-sm hover:text-primary transition-colors"
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
