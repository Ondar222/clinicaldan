#!/bin/bash
# Убирает маркеры конфликта в vite.config.ts на сервере.
# Запускать из каталога проекта: bash scripts/fix-vite-merge-conflict.sh

set -e
FILE="${1:-vite.config.ts}"

if [ ! -f "$FILE" ]; then
  echo "Файл не найден: $FILE"
  exit 1
fi

# Удалить блок от "<<<<<<< Updated upstream" до "=======" (включительно)
# Затем удалить строку ">>>>>>> Stashed changes"
sed -i.bak '/^<<<<<<< Updated upstream$/,/^=======$/d' "$FILE"
sed -i.bak '/^>>>>>>> Stashed changes$/d' "$FILE"

echo "Маркеры конфликта удалены. Резервная копия: ${FILE}.bak"
echo "Проверьте файл и запустите: npm run build"
