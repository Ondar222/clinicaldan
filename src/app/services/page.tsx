import { permanentRedirect } from 'next/navigation';

/**
 * Маршрут /services существует в sitemap и в ссылках (хлебные крошки
 * косметологии), но отдельной страницы у раздела нет — редиректим
 * на список направлений, чтобы не отдавать 404.
 */
export default function ServicesIndexPage() {
  permanentRedirect('/directions');
}
