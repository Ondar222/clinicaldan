'use client';

import { useMemo, useState } from 'react';
import type { ApiService, ArchimedDoctor } from '../types/cms';

type Tab = 'doctors' | 'prices' | 'services';

interface ArchimedAdminPanelProps {
  doctors: ArchimedDoctor[];
  services: ApiService[];
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastUpdated: string | null;
  error?: string | null;
}

const PAGE_SIZE = 20;

const money = (value?: number) =>
  typeof value === 'number' && value > 0
    ? `${value.toLocaleString('ru-RU')} ₽`
    : '—';

const doctorName = (doctor: ArchimedDoctor) =>
  [doctor.name, doctor.name1, doctor.name2].filter(Boolean).join(' ').trim();

const normalize = (value: unknown) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е');

export default function ArchimedAdminPanel({
  doctors,
  services,
  onRefresh,
  isRefreshing,
  lastUpdated,
  error,
}: ArchimedAdminPanelProps) {
  const [tab, setTab] = useState<Tab>('doctors');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const serviceGroups = useMemo(() => {
    const groups = new Map<string, { id: number; name: string; services: ApiService[] }>();
    for (const service of services) {
      const key = String(service.group_id ?? 0);
      const current = groups.get(key) ?? {
        id: Number(key),
        name: service.group_name || `Группа ${key}`,
        services: [],
      };
      current.services.push(service);
      groups.set(key, current);
    }
    return Array.from(groups.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'ru'),
    );
  }, [services]);

  const filteredDoctors = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return doctors;
    return doctors.filter((doctor) =>
      normalize(
        [
          doctorName(doctor),
          doctor.type,
          doctor.branch,
          doctor.category,
          ...(doctor.types ?? []).map((type) => type.name),
        ].join(' '),
      ).includes(q),
    );
  }, [doctors, query]);

  const filteredServices = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return services;
    return services.filter((service) =>
      normalize(
        [service.name, service.altname, service.code, service.group_name].join(' '),
      ).includes(q),
    );
  }, [services, query]);

  const filteredGroups = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return serviceGroups;
    return serviceGroups.filter((group) => normalize(group.name).includes(q));
  }, [serviceGroups, query]);

  const currentRows = tab === 'doctors' ? filteredDoctors : tab === 'prices' ? filteredServices : filteredGroups;
  const totalPages = Math.max(1, Math.ceil(currentRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleRows = currentRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const switchTab = (next: Tab) => {
    setTab(next);
    setQuery('');
    setPage(1);
  };

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: 'doctors', label: 'Врачи', count: doctors.length },
    { key: 'prices', label: 'Прайс', count: services.length },
    { key: 'services', label: 'Услуги', count: serviceGroups.length },
  ];

  return (
    <section className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-4 bg-primary text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Данные из Архимеда</h2>
          <p className="text-sm text-white/85">
            Врачи: {doctors.length} · Услуги: {services.length} · Группы услуг: {serviceGroups.length}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1">
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={isRefreshing}
            className="px-4 py-2 text-sm bg-white text-primary rounded font-medium hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isRefreshing ? 'Обновляем из Архимеда…' : 'Обновить из Архимеда'}
          </button>
          {lastUpdated && (
            <span className="text-xs text-white/80">
              Обновлено: {lastUpdated}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 px-6 pt-4">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => switchTab(item.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === item.key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.label}: {item.count}
          </button>
        ))}
      </div>

      <div className="p-6 border-b border-gray-200">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder={tab === 'doctors' ? 'Поиск врача...' : tab === 'prices' ? 'Поиск услуги или цены...' : 'Поиск группы услуг...'}
          className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="mt-2 text-sm text-gray-500">
          Показано {visibleRows.length} из {currentRows.length}
          {isRefreshing ? ' · идёт обновление данных…' : ''}
        </p>
      </div>

      {visibleRows.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Данных пока нет — нажмите «Обновить из Архимеда»</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {tab === 'doctors' ? (
                  <>
                    <th className="px-4 py-3 font-semibold">ФИО</th>
                    <th className="px-4 py-3 font-semibold">Специальность</th>
                    <th className="px-4 py-3 font-semibold">Отделение</th>
                    <th className="px-4 py-3 font-semibold">ID</th>
                  </>
                ) : tab === 'prices' ? (
                  <>
                    <th className="px-4 py-3 font-semibold">Услуга</th>
                    <th className="px-4 py-3 font-semibold">Группа</th>
                    <th className="px-4 py-3 font-semibold">Цена</th>
                    <th className="px-4 py-3 font-semibold">Срочно</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-semibold">Группа услуг</th>
                    <th className="px-4 py-3 font-semibold">Услуг</th>
                    <th className="px-4 py-3 font-semibold">Диапазон цен</th>
                    <th className="px-4 py-3 font-semibold">ID</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tab === 'doctors' &&
                (visibleRows as ArchimedDoctor[]).map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{doctorName(doctor) || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{doctor.type || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{doctor.branch || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{doctor.id}</td>
                  </tr>
                ))}

              {tab === 'prices' &&
                (visibleRows as ApiService[]).map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {service.name}
                      <div className="text-xs text-gray-500">{service.code}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{service.group_name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{money(service.base_cost)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{money(service.cito_cost)}</td>
                  </tr>
                ))}

              {tab === 'services' &&
                (visibleRows as Array<{ id: number; name: string; services: ApiService[] }>).map((group) => {
                  const prices = group.services
                    .map((service) => service.cito_cost > 0 ? service.cito_cost : service.base_cost)
                    .filter((price) => price > 0);
                  const min = prices.length ? Math.min(...prices) : 0;
                  const max = prices.length ? Math.max(...prices) : 0;
                  return (
                    <tr key={group.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{group.name}</td>
                      <td className="px-4 py-3">{group.services.length}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {prices.length ? `${money(min)} – ${money(max)}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{group.id}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          <span className="text-sm text-gray-600">Стр. {safePage} из {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Вперёд
          </button>
        </div>
      )}
    </section>
  );
}
