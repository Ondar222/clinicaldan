'use client';
/**
 * Главная страница — композиция секций.
 * Повторяет структуру HomePage из прежнего src/App.tsx (Vite + react-router).
 */
import Hero from './Hero';
import ServiceGrid from './ServiceGrid';
import News from './News';
import Checkups from './Checkups';
import Advantages from './Advantages';
import Testimonials from './Testimonials';
import ContactForm from './ContactForm';
import Tools from './Tools';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceGrid />
      <News limit={5} showPagination={false} />
      <Checkups />
      <Advantages />
      <Testimonials />
      <ContactForm />
      <Tools />
    </>
  );
}
