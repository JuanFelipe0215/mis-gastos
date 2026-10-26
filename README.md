# Mis Gastos

App web para registrar gastos personales en pesos colombianos (COP). Funciona 100% en el navegador: sin backend, sin base de datos en servidor, y se puede instalar en el celular como PWA (funciona offline).

## Funcionalidades

- Registro rápido: **+ → monto → categoría → Guardar**. Recuerda la última categoría usada.
- Resúmenes por **día, semana (lunes a domingo) y mes**, con total, variación vs. el período anterior, barras por día y dona por categoría.
- Historial por mes con búsqueda y filtro por categoría. Toca un gasto para editarlo o eliminarlo (con "Deshacer").
- Categorías editables (emoji, nombre, color). Al eliminar una, sus gastos pasan a "Otros".
- Respaldo: exportar/importar **JSON** (copia completa) y **CSV** (separado por `;`, abre directo en Excel en español). Importar permite *combinar* (sin duplicar, por `id`) o *reemplazar*.
- Modo claro / oscuro / sistema.

## Stack

React 19 + TypeScript + Vite · Tailwind CSS v4 · Dexie (IndexedDB) · Recharts · date-fns · zod · vite-plugin-pwa · Vitest

## Almacenamiento

Los datos viven en **IndexedDB** del navegador (vía Dexie). Al abrir, la app pide almacenamiento persistente (`navigator.storage.persist()`) para que el navegador no lo borre por falta de espacio.

Límites a tener en cuenta:

- Si borras los datos del sitio o cambias de navegador/dispositivo, los datos no te siguen. **Haz respaldos** (la app te recuerda cada 15 días).
- En iOS/Safari, instala la app en la pantalla de inicio; si no, Safari puede borrar los datos tras ~7 días sin uso.

Decisiones de modelo: montos como **enteros** en COP y fechas como texto local `YYYY-MM-DD` (evita que `toISOString()` corra la fecha en UTC-5).

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas unitarias (Vitest)
npm run lint       # oxlint
npm run build      # build de producción en dist/
```

## Estructura

```
src/
├─ db/            # esquema Dexie, categorías por defecto, hooks reactivos
├─ features/
│  ├─ expenses/   # formulario, lista y CRUD de gastos
│  ├─ summary/    # gráficos
│  ├─ categories/ # gestión de categorías
│  └─ backup/     # export/import JSON y CSV, recordatorio, info de almacenamiento
├─ components/    # UI genérica (BottomSheet, NavBar, AmountInput, Toast...)
├─ hooks/         # useTheme, useToday
├─ lib/           # dinero, fechas, csv, resúmenes, preferencias
└─ pages/         # Inicio, Historial, Resumen, Ajustes
```

## Flujo de trabajo (Git Flow)

- `main`: producción. Cada push despliega a GitHub Pages (`.github/workflows/deploy.yml`).
- `develop`: integración. Las ramas `feature/*` se abren desde aquí y vuelven por PR.
- Releases: PR de `develop` → `main`.

Para activar el deploy: *Settings → Pages → Source: GitHub Actions*.
