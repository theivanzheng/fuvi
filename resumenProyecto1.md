# FUVI – Resumen Entrega 1

## ¿Cómo ejecutar ej proyecto?


## ¿Qué es FUVI?

FUVI es una aplicación web de tipo PWA (Progressive Web App) orientada a dispositivos móviles, diseñada para ayudar a personas con dificultades cognitivas o de aprendizaje a llevar a cabo rutinas del día a día. La app guía al usuario paso a paso a través de tareas cotidianas (lavar las manos, hacer la cama, poner la lavadora...) mediante pictogramas, instrucciones sencillas, sonidos de retroalimentación y una celebración visual al completar cada tarea.

El nombre FUVI hace referencia al personaje avatar que acompaña al usuario durante toda la experiencia.

---

## Stack tecnológico

- **Angular 21** (con componentes standalone, sin NgModules)
- **TypeScript 5.9**
- **RxJS 7.8**
- **Vitest** para pruebas unitarias
- **HTML + CSS** con variables CSS personalizadas
- **localStorage** para persistencia de datos (sin backend en esta entrega)

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── models/          → habito.model.ts (interfaces de datos)
│   │   └── services/        → habitos.service.ts, audio-feedback.service.ts
│   ├── habitos/
│   │   └── paginas/
│   │       ├── pagina-principal/     → Pantalla de inicio
│   │       ├── rutinas-momento/      → Lista de tareas por momento del día
│   │       ├── detalle-habito/       → Vista paso a paso de una tarea
│   │       └── celebracion-habito/  → Pantalla de celebración al completar
│   ├── configuracion/
│   │   └── paginas/
│   │       └── configuracion-avatar/ → Selector de avatar
│   └── shared/
│       └── components/
│           ├── cabecera-fuvi/   → Componente de cabecera reutilizable
│           ├── tarjeta-habito/  → Tarjeta de cada hábito en la lista
│           └── progreso-bar/    → Barra de progreso segmentada
└── assets/
    ├── audio/   → click.wav, winning.wav
    └── images/  → Avatares, pictogramas de momentos del día, pictogramas de pasos
```

---

## Modelo de datos (Entrega 1)

Todo el estado de la aplicación vive en memoria y en `localStorage`. No hay base de datos externa.

```typescript
interface Habito {
  id: number;
  nombre: string;
  imagenPortada: string;
  color: string;
  completado: boolean;
  momento: 'manana' | 'mediodia' | 'noche';
  tipoDia: 'semana' | 'finde' | 'ambos';
  pasos: PasoHabito[];
}

interface PasoHabito {
  texto: string;
  imagen: string;
}
```

Las claves usadas en `localStorage` son:
- `fuvi_habitos_v3` – array de hábitos con su estado de completado
- `fuvi_avatar_v1` – avatar seleccionado por el usuario (`'female'` | `'male'`)

---

## Hábitos incluidos (9 en total)

| Nombre | Momento | Tipo de día |
|---|---|---|
| Lavar las manos | Mañana | Todos |
| Hacer la cama | Mañana | Semana |
| Poner lavadora | Mediodía | Fin de semana |
| Recoger platos | Noche | Todos |
| Ordenar la habitación | Mañana | Todos |
| Preparar la mesa | Mediodía | Semana |
| Enjuagar platos | Mediodía | Todos |
| Higiene antes de dormir | Noche | Todos |
| Colada del fin de semana | Mediodía | Fin de semana |

---

## Navegación y rutas

```
/                           → Pantalla de inicio (selección de momento del día)
/rutinas/:momento           → Lista de tareas filtradas (manana / mediodia / noche)
/habitos/:id                → Detalle paso a paso de una tarea
/habitos/:id/completado     → Pantalla de celebración
/configuracion/avatar       → Cambio de avatar
```

---

## Funcionalidades implementadas

- **Selección de momento del día**: el usuario elige entre mañana, mediodía o noche y ve solo las tareas que le corresponden según el día (laborable o fin de semana).
- **Guía paso a paso**: cada hábito se desglosa en pasos secuenciales con pictograma e instrucción de texto.
- **Progreso visual**: barra de progreso segmentada tanto en la lista de rutinas como dentro de cada tarea.
- **Celebración**: animación de confeti, sonido y avatar en pose de celebración al completar un hábito.
- **Retroalimentación sonora**: sonido de clic al avanzar pasos y sonido de victoria al completar.
- **Avatar personalizable**: el usuario puede elegir entre avatar femenino o masculino. La elección persiste en `localStorage`.
- **Reset de tareas**: botón para reiniciar todas las tareas cuando se han completado todas las del momento.
- **Diseño responsivo**: orientado a móvil, con un panel de máximo 768px de ancho.

---

## Gestión de estado

Se usa el sistema de señales de Angular 21 (Signals) dentro de `HabitosService`:

- `habitos` (signal) – array completo de hábitos y su estado
- `avatarSeleccionado` (signal) – avatar actual
- `totalHabitos` (computed) – total de hábitos
- `totalCompletados` (computed) – hábitos marcados como completados
- `progresoGeneral` (computed) – porcentaje de progreso global

---

## Lo que NO tiene esta entrega

- Backend / servidor
- Base de datos persistente externa
- Autenticación de usuarios
- Múltiples usuarios
- Rol de administrador
- Registro de tiempos o estadísticas de uso
- Panel de gestión de hábitos

Estas son precisamente las líneas de evolución para la siguiente entrega.
