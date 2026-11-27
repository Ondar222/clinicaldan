'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { DoctorInput, ServiceInput } from '../services/adminCatalog';
import type { ApiService, ArchimedDoctor } from '../types/cms';

type Tab = 'doctors' | 'prices' | 'services';

interface ArchimedAdminPanelProps {
  doctors: ArchimedDoctor[];
  services: ApiService[];
  /** Если обновление недоступно для роли, кнопка скрывается. */
  onRefresh?: () => Promise<void>;
  isRefreshing: boolean;
  lastUpdated: string | null;
  error?: string | null;
  /** CRUD показываем только admin/staff. */
  canEdit?: boolean;
  onSaveDoctor?: (input: DoctorInput, id?: number) => Promise<ArchimedDoctor>;
  onDeleteDoctor?: (id: number) => Promise<void>;
  onSaveService?: (input: ServiceInput, id?: number) => Promise<ApiService>;
  onDeleteService?: (id: number) => Promise<void>;
}

type EditorState =
  | { kind: 'doctor'; id?: number; initial: DoctorInput }
  | { kind: 'service'; id?: number; initial: ServiceInput }
  | null;

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

const messageFromError = (error: unknown) =>
  error instanceof Error && error.message
    ? error.message
    : 'Не удалось сохранить изменения';

const parseNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const actionClass =
  'px-2.5 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed';

function DoctorEditor({
  initial,
  submitting,
  error,
  onSubmit,
  onClose,
}: {
  initial: DoctorInput;
  submitting: boolean;
  error: string | null;
  onSubmit: (input: DoctorInput) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<DoctorInput>(initial);
  const set = (key: keyof DoctorInput, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...form,
      name: form.name?.trim() ?? '',
      name1: form.name1?.trim() ?? '',
      name2: form.name2?.trim() ?? '',
      type: form.type?.trim() ?? '',
      branch: form.branch?.trim() ?? '',
      category: form.category?.trim() ?? '',
      phone: form.phone?.trim() ?? '',
      info: form.info?.trim() ?? '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-doctor-title"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 id="catalog-doctor-title" className="text-lg font-semibold text-dark">
            {initial.name ? 'Изменить врача' : 'Добавить врача'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="catalog-doctor-last" className={labelClass}>Фамилия *</label>
              <input id="catalog-doctor-last" required className={inputClass} value={form.name ?? ''} onChange={(event) => set('name', event.target.value)} />
            </div>
            <div>
              <label htmlFor="catalog-doctor-first" className={labelClass}>Имя</label>
              <input id="catalog-doctor-first" className={inputClass} value={form.name1 ?? ''} onChange={(event) => set('name1', event.target.value)} />
            </div>
            <div>
              <label htmlFor="catalog-doctor-middle" className={labelClass}>Отчество</label>
              <input id="catalog-doctor-middle" className={inputClass} value={form.name2 ?? ''} onChange={(event) => set('name2', event.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="catalog-doctor-type" className={labelClass}>Специальность *</label>
            <input id="catalog-doctor-type" required className={inputClass} value={form.type ?? ''} onChange={(event) => set('type', event.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="catalog-doctor-branch" className={labelClass}>Отделение</label>
              <input id="catalog-doctor-branch" className={inputClass} value={form.branch ?? ''} onChange={(event) => set('branch', event.target.value)} />
            </div>
            <div>
              <label htmlFor="catalog-doctor-category" className={labelClass}>Категория</label>
              <input id="catalog-doctor-category" className={inputClass} value={form.category ?? ''} onChange={(event) => set('category', event.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="catalog-doctor-phone" className={labelClass}>Телефон</label>
            <input id="catalog-doctor-phone" className={inputClass} value={form.phone ?? ''} onChange={(event) => set('phone', event.target.value)} />
          </div>
          <div>
            <label htmlFor="catalog-doctor-info" className={labelClass}>Информация</label>
            <textarea id="catalog-doctor-info" rows={3} className={inputClass} value={form.info ?? ''} onChange={(event) => set('info', event.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Отмена
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-primary text-white rounded-md font-medium hover:bg-primaryDark disabled:opacity-60">
              {submitting ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ServiceEditor({
  initial,
  submitting,
  error,
  onSubmit,
  onClose,
}: {
  initial: ServiceInput;
  submitting: boolean;
  error: string | null;
  onSubmit: (input: ServiceInput) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ServiceInput>(initial);
  const setText = (key: keyof ServiceInput, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const setNumber = (key: keyof ServiceInput, value: string) =>
    setForm((current) => ({ ...current, [key]: parseNumber(value) }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...form,
      name: form.name?.trim() ?? '',
      code: form.code?.trim() ?? '',
      altname: form.altname?.trim() ?? '',
      group_name: form.group_name?.trim() ?? '',
      info: form.info?.trim() ?? '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-service-title"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 id="catalog-service-title" className="text-lg font-semibold text-dark">
            {initial.name ? 'Изменить услугу' : 'Добавить услугу'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="catalog-service-name" className={labelClass}>Название *</label>
            <input id="catalog-service-name" required className={inputClass} value={form.name ?? ''} onChange={(event) => setText('name', event.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="catalog-service-code" className={labelClass}>Код</label>
              <input id="catalog-service-code" className={inputClass} value={form.code ?? ''} onChange={(event) => setText('code', event.target.value)} />
            </div>
            <div>
              <label htmlFor="catalog-service-altname" className={labelClass}>Альтернативное название</label>
              <input id="catalog-service-altname" className={inputClass} value={form.altname ?? ''} onChange={(event) => setText('altname', event.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="catalog-service-group-name" className={labelClass}>Группа услуг</label>
              <input id="catalog-service-group-name" className={inputClass} value={form.group_name ?? ''} onChange={(event) => setText('group_name', event.target.value)} />
            </div>
            <div>
              <label htmlFor="catalog-service-group-id" className={labelClass}>ID группы</label>
              <input
                id="catalog-service-group-id"
                type="number"
                step="1"
                className={inputClass}
                value={form.group_id ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    group_id: event.target.value.trim() ? Number(event.target.value) : null,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="catalog-service-base" className={labelClass}>Базовая цена</label>
              <input id="catalog-service-base" type="number" step="0.01" min="0" className={inputClass} value={form.base_cost ?? ''} onChange={(event) => setNumber('base_cost', event.target.value)} />
            </div>
            <div>
              <label htmlFor="catalog-service-cito" className={labelClass}>Срочная цена</label>
              <input id="catalog-service-cito" type="number" step="0.01" min="0" className={inputClass} value={form.cito_cost ?? ''} onChange={(event) => setNumber('cito_cost', event.target.value)} />
            </div>
            <div>
              <label htmlFor="catalog-service-duration" className={labelClass}>Длительность, мин</label>
              <input id="catalog-service-duration" type="number" step="1" min="0" className={inputClass} value={form.duration ?? ''} onChange={(event) => setNumber('duration', event.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="catalog-service-info" className={labelClass}>Описание</label>
            <textarea id="catalog-service-info" rows={3} className={inputClass} value={form.info ?? ''} onChange={(event) => setText('info', event.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.price_web_visible !== false}
              onChange={(event) =>
                setForm((current) => ({ ...current, price_web_visible: event.target.checked }))
              }
            />
            Показывать услугу на сайте
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Отмена
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-primary text-white rounded-md font-medium hover:bg-primaryDark disabled:opacity-60">
              {submitting ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ArchimedAdminPanel({
  doctors,
  services,
  onRefresh,
  isRefreshing,
  lastUpdated,
  error,
  canEdit = false,
  onSaveDoctor,
  onDeleteDoctor,
  onSaveService,
  onDeleteService,
}: ArchimedAdminPanelProps) {
  const [tab, setTab] = useState<Tab>('doctors');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canEditDoctors = canEdit && !!onSaveDoctor && !!onDeleteDoctor;
  const canEditServices = canEdit && !!onSaveService && !!onDeleteService;
  const busy = isRefreshing || isSaving || deletingId !== null;

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

  const showActions = (tab === 'doctors' && canEditDoctors) || (tab === 'prices' && canEditServices);
  const canAdd = (tab === 'doctors' && canEditDoctors) || (tab === 'prices' && canEditServices);

  const switchTab = (next: Tab) => {
    setTab(next);
    setQuery('');
    setPage(1);
  };

  const openDoctorEditor = (doctor?: ArchimedDoctor) => {
    if (!canEditDoctors) return;
    setSaveError(null);
    setEditor({
      kind: 'doctor',
      id: doctor?.id,
      initial: doctor
        ? {
            name: doctor.name ?? '',
            name1: doctor.name1 ?? '',
            name2: doctor.name2 ?? '',
            type: doctor.type ?? '',
            branch: doctor.branch ?? '',
            category: doctor.category ?? '',
            phone: doctor.phone ?? '',
            info: doctor.info ?? '',
          }
        : { name: '', name1: '', name2: '', type: '', branch: '', category: '', phone: '', info: '' },
    });
  };

  const openServiceEditor = (service?: ApiService) => {
    if (!canEditServices) return;
    setSaveError(null);
    setEditor({
      kind: 'service',
      id: service?.id,
      initial: service
        ? {
            name: service.name ?? '',
            code: service.code ?? '',
            altname: service.altname ?? '',
            group_name: service.group_name ?? '',
            group_id: service.group_id ?? null,
            base_cost: service.base_cost ?? 0,
            cito_cost: service.cito_cost ?? 0,
            duration: service.duration ?? 0,
            price_web_visible: service.price_web_visible !== false,
            info: service.info ?? '',
          }
        : {
            name: '',
            code: '',
            altname: '',
            group_name: '',
            group_id: null,
            base_cost: 0,
            cito_cost: 0,
            duration: 0,
            price_web_visible: true,
            info: '',
          },
    });
  };

  const handleDelete = async (kind: 'doctor' | 'service', id: number, name: string) => {
    const callback = kind === 'doctor' ? onDeleteDoctor : onDeleteService;
    if (!callback) return;
    const entity = kind === 'doctor' ? 'врача' : 'услугу';
    if (!window.confirm(`Удалить ${entity} «${name}»? Запись будет скрыта на сайте и в кабинете.`)) return;

    setDeletingId(`${kind}:${id}`);
    setSaveError(null);
    try {
      await callback(id);
    } catch (deleteError) {
      setSaveError(messageFromError(deleteError));
    } finally {
      setDeletingId(null);
    }
  };

  const submitEditor = async (input: DoctorInput | ServiceInput) => {
    if (!editor) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      if (editor.kind === 'doctor' && onSaveDoctor) {
        await onSaveDoctor(input as DoctorInput, editor.id);
      } else if (editor.kind === 'service' && onSaveService) {
        await onSaveService(input as ServiceInput, editor.id);
      }
      setEditor(null);
    } catch (saveErrorValue) {
      setSaveError(messageFromError(saveErrorValue));
    } finally {
      setIsSaving(false);
    }
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
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {canAdd && (
            <button
              type="button"
              onClick={() => (tab === 'doctors' ? openDoctorEditor() : openServiceEditor())}
              disabled={busy}
              className="px-4 py-2 text-sm bg-white text-primary rounded font-medium hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {tab === 'doctors' ? '+ Добавить врача' : '+ Добавить услугу'}
            </button>
          )}
          {onRefresh && (
            <div className="flex flex-col items-start sm:items-end gap-1">
              <button
                type="button"
                onClick={() => void onRefresh()}
                disabled={busy}
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
          )}
        </div>
      </div>

      {(error || saveError) && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error || saveError}
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
        <div className="p-8 text-center text-gray-500">
          {onRefresh ? 'Данных пока нет — нажмите «Обновить из Архимеда»' : 'Данных пока нет'}
        </div>
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
                {showActions && <th className="px-4 py-3 font-semibold">Действия</th>}
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
                    {canEditDoctors && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button type="button" className={actionClass} disabled={busy} onClick={() => openDoctorEditor(doctor)}>
                            Изменить
                          </button>
                          <button
                            type="button"
                            className={`${actionClass} text-red-600 border-red-200 hover:bg-red-50`}
                            disabled={busy}
                            onClick={() => void handleDelete('doctor', doctor.id, doctorName(doctor))}
                          >
                            {deletingId === `doctor:${doctor.id}` ? 'Удаляем…' : 'Удалить'}
                          </button>
                        </div>
                      </td>
                    )}
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
                    {canEditServices && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button type="button" className={actionClass} disabled={busy} onClick={() => openServiceEditor(service)}>
                            Изменить
                          </button>
                          <button
                            type="button"
                            className={`${actionClass} text-red-600 border-red-200 hover:bg-red-50`}
                            disabled={busy}
                            onClick={() => void handleDelete('service', service.id, service.name)}
                          >
                            {deletingId === `service:${service.id}` ? 'Удаляем…' : 'Удалить'}
                          </button>
                        </div>
                      </td>
                    )}
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

      {editor?.kind === 'doctor' && (
        <DoctorEditor
          key={`doctor-${editor.id ?? 'new'}`}
          initial={editor.initial}
          submitting={isSaving}
          error={saveError}
          onClose={() => { setEditor(null); setSaveError(null); }}
          onSubmit={(input) => void submitEditor(input)}
        />
      )}
      {editor?.kind === 'service' && (
        <ServiceEditor
          key={`service-${editor.id ?? 'new'}`}
          initial={editor.initial}
          submitting={isSaving}
          error={saveError}
          onClose={() => { setEditor(null); setSaveError(null); }}
          onSubmit={(input) => void submitEditor(input)}
        />
      )}
    </section>
  );
}
