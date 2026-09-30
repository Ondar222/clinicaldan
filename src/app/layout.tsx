import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { CLINIC_CONFIG } from '@/data/clinicConfig';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingBooking from '@/components/FloatingBooking';
import CookieNotification from '@/components/CookieNotification';
import TopBar from '@/components/TopBar';
import BviInit from '@/components/BviInit';
import ScrollToTop from '@/components/ScrollToTop';
import AppPrefetch from '@/components/AppPrefetch';
import YandexMetrika from '@/components/YandexMetrika';
import ClinicJsonLd from '@/components/ClinicJsonLd';
import './globals.css';
import './topbar.css';
import './auth-modal.css';

export const metadata: Metadata = {
  metadataBase: new URL(CLINIC_CONFIG.siteUrl),
  title: {
    default: CLINIC_CONFIG.defaultTitle,
    template: `%s | ${CLINIC_CONFIG.siteName}`,
  },
  description: CLINIC_CONFIG.defaultDescription,
  keywords:
    'клиника Алдан, клиника Алдан Кызыл, чекап Алдан, УЗИ Алдан, анализы Алдан, гинеколог Алдан, кардиолог Алдан, терапевт Алдан, чекап Кызыл, УЗИ Кызыл, гинеколог Кызыл, кардиолог Кызыл, анализы Кызыл, медицина Кызыл',
  applicationName: CLINIC_CONFIG.siteName,
  authors: [{ name: CLINIC_CONFIG.siteName }],
  creator: CLINIC_CONFIG.siteName,
  publisher: CLINIC_CONFIG.siteName,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: `${CLINIC_CONFIG.siteUrl}/`,
    siteName: CLINIC_CONFIG.siteName,
    title: `${CLINIC_CONFIG.siteName} - медицинская клиника в Кызыле`,
    description:
      'Современная многопрофильная клиника Алдан в Кызыле с 2013 года. Более 25 направлений: УЗИ, анализы, чекап, гинекология, кардиология. Будни до 22:00.',
    images: [
      {
        url: CLINIC_CONFIG.defaultImage,
        width: 1200,
        height: 630,
        alt: CLINIC_CONFIG.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${CLINIC_CONFIG.siteName} - медицинская клиника в Кызыле`,
    description:
      'Современная многопрофильная клиника Алдан в Кызыле с 2013 года. Более 25 медицинских направлений.',
    images: [CLINIC_CONFIG.defaultImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.png',
  },
  other: {
    'yandex-verification': 'ddb71b8b525e49c3',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d2002e',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <ClinicJsonLd />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Ограничиваем размер иконок в top-bar до загрузки CSS (из index.html) */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              '.top-bar .contact-icon,.top-bar .top-bar-icon{width:1rem;height:1rem;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}.top-bar .contact-icon svg,.top-bar .top-bar-icon svg{width:100%;height:100%}',
          }}
        />
        {/* Виджет записи Archimed */}
        <Script
          src="https://widget.archimed-soft.ru/init/8b376fec94c62b15cfd228227a24eb95"
          strategy="afterInteractive"
        />
        {/* Скрипты версии для слабовидящих (lidrekon) */}
        <Script
          src="https://lidrekon.ru/slep/js/jquery.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://lidrekon.ru/slep/js/uhpv-full.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <YandexMetrika />
        <TopBar />
        <div className="min-h-screen flex flex-col">
          <ScrollToTop />
          <AppPrefetch />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <FloatingBooking />
          <CookieNotification />
        </div>
        <BviInit />
      </body>
    </html>
  );
}
