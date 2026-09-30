// У пакета bvi нет TypeScript-деклараций.
// Объявляем модуль как any, чтобы динамический import('bvi') проходил typecheck.
declare module 'bvi';
