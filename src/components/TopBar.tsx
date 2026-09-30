import Link from 'next/link';

/**
 * Верхняя панель — перенесена из статического <body> в index.html.
 * Рендерится на сервере, ссылки на внутренние разделы — next/link.
 */
export default function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="contact-item">
          <span className="contact-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </span>
          <Link href="/contacts" className="contact-link">
            Контакты
          </Link>
        </div>
        <div className="contact-item">
          <span className="contact-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </span>
          <a href="tel:+79233176060" className="contact-link">
            +7 (923) 317-60-60
          </a>
        </div>
      </div>
      <div className="top-bar-right">
        <a
          href="http://user.clinicaldan.ru/login"
          id="authTrigger"
          className="top-bar-icon"
          aria-label="Войти или зарегистрироваться"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </a>
        <Link href="/certificates" className="top-bar-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </Link>
        <p
          id="specialButton"
          className="special-button"
          style={{ fontSize: 16, cursor: 'pointer', height: 20 }}
        >
          <strong>ВЕРСИЯ ДЛЯ СЛАБОВИДЯЩИХ</strong>
        </p>
      </div>
    </div>
  );
}
