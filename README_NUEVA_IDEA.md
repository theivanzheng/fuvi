# FUVI – Plan de ampliación: Backend + MongoDB

> Estado actual breve: la implementación real ya está avanzada y se ha hecho con Node.js + Express + driver oficial de MongoDB, no con Mongoose. El login simple, el seed, la conexión Angular-backend, la sesión persistida en MongoDB, el avatar en MongoDB y las rutinas por usuario ya están funcionando.

## Punto de partida

La primera entrega de FUVI es una aplicación Angular completamente funcional que guía a personas con dificultades cognitivas a través de sus rutinas diarias. Tiene pictogramas, pasos secuenciales, sonidos, celebración y un diseño móvil cuidado.

Sin embargo, toda la lógica vive en el propio navegador: los hábitos están escritos a mano en el código (`HabitosService`) y el estado se guarda en `localStorage`. Esto significa que todos los usuarios que abran la aplicación ven exactamente las mismas rutinas y no existe ninguna noción de "quién está usando la app ahora mismo".

La segunda entrega introduce tres cambios estructurales:

1. **Una pantalla de login simple** para identificar qué usuario es el que está usando la app.
2. **Un backend con Node.js y Express** que responde a las peticiones de Angular.
3. **Una base de datos MongoDB Atlas** que guarda usuarios, rutinas y qué rutinas tiene asignadas cada usuario.

### Qué NO cambia

- El diseño visual de la app.
- Los componentes Angular existentes (cabecera, tarjeta, barra de progreso, pasos, celebración, audio).
- La estructura de rutas (salvo añadir la pantalla de login al inicio).
- La lógica de filtrado por momento del día y tipo de día.

### Qué NO se implementa en esta versión

- Panel de administrador.
- Roles (admin/usuario).
- Contraseñas.
- JWT ni tokens de ningún tipo.
- Estadísticas de tiempo o registros de sesión.
- Registro público de nuevos usuarios.

Los usuarios se crean directamente en la base de datos, de forma manual o mediante un script de inicialización. No hay formulario de registro.

---

## Arquitectura objetivo

Pasamos de una aplicación de una sola capa a una arquitectura de tres capas conectadas:

```
┌──────────────────────────────────────┐
│          FRONTEND (Angular)          │
│  - Pantalla de login (nueva)         │
│  - Resto de pantallas existentes     │
└─────────────────┬────────────────────┘
                  │  HTTP / API REST
                  │  (peticiones fetch o HttpClient)
┌─────────────────▼────────────────────┐
│       BACKEND (Node.js + Express)    │
│  - Recibe peticiones del frontend    │
│  - Aplica la lógica de negocio       │
│  - Consulta o escribe en MongoDB     │
└─────────────────┬────────────────────┘
                  │  Mongoose (ODM)
┌─────────────────▼────────────────────┐
│        BASE DE DATOS (MongoDB Atlas) │
│  - Colección: usuarios               │
│  - Colección: rutinas                │
│  - Colección: usuarioRutinas         │
└──────────────────────────────────────┘
```

El frontend Angular sigue siendo una SPA estática. No sabe nada de la base de datos; solo habla con el backend a través de peticiones HTTP. El backend traduce esas peticiones a operaciones de base de datos usando Mongoose.

---

## Stack tecnológico completo

### Frontend (ya existente)

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21 | Framework principal |
| TypeScript | 5.9 | Lenguaje de programación |
| HTML + CSS | — | Plantillas y estilos |
| Angular Signals | — | Gestión de estado reactivo |
| Angular Router | — | Navegación entre pantallas |
| Angular HttpClient | — | Peticiones HTTP al backend |
| Componentes standalone | — | Sin NgModules |

### Backend (nuevo)

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución de JavaScript en servidor |
| Express | Framework para crear el servidor HTTP y las rutas |
| Mongoose | ODM: conecta Node.js con MongoDB y define los schemas |
| dotenv | Carga variables de entorno desde un archivo `.env` |
| cors | Permite que Angular (en otro puerto) llame al backend |
| nodemon | Reinicia el servidor automáticamente al guardar cambios (solo en desarrollo) |

### Base de datos (nueva)

| Tecnología | Uso |
|---|---|
| MongoDB Atlas | Servicio cloud de MongoDB (gratuito en tier M0) |
| Colecciones MongoDB | Equivalente a tablas en SQL, guardan documentos JSON |
| ObjectId | Identificador único generado automáticamente por MongoDB para cada documento |

---

## Qué es Mongoose y por qué se usa

Mongoose es una librería de Node.js que actúa como intermediario entre el código JavaScript y MongoDB. Sin Mongoose habría que escribir consultas en el lenguaje nativo de MongoDB, que es más verboso y difícil de mantener. Con Mongoose se definen **schemas**, que son plantillas que describen la estructura de cada documento antes de guardarlo en la base de datos.

La analogía más directa: MongoDB es la base de datos, Node.js es el servidor, y Mongoose es el puente que los conecta de forma ordenada (equivalente a Sequelize con MySQL, o Hibernate con Java).

La cadena de conexión para este proyecto, usando el cluster ya existente en Atlas, tiene este formato:

```javascript
const MONGO_URI = `mongodb+srv://dbIvanZhengSPW:Lavender1314@spwivanzhengupsa.jy9zrb9.mongodb.net/fuvi`

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err))
```

Esta conexión se realiza una única vez al arrancar el servidor y el archivo que la contiene se suele llamar `config/db.js`.

---

## Modelo de datos en MongoDB

MongoDB no tiene tablas ni filas como SQL. Guarda datos en **colecciones** de documentos JSON. Para esta versión necesitamos tres colecciones.

### Por qué "rutina" y no "hábito"

En la entrega 1 el concepto se llamaba `Habito` por razones históricas del desarrollo. En esta nueva versión renombramos el concepto a **rutina** porque es el término que se usa en toda la app de cara al usuario ("rutinas de mañana", "rutinas de mediodía") y resulta más coherente y comprensible para el código. Los componentes visuales y el flujo de pantallas no cambian, solo el nombre del concepto en los modelos de datos y en el backend.

---

### Colección `usuarios`

Representa a las personas que pueden entrar en la aplicación.

```js
{
  _id: ObjectId,     // generado automáticamente por MongoDB
  nombre: String     // nombre único del usuario, ej: "Jordyn"
}
```

**Reglas importantes:**
- `_id` es la clave primaria, generada por MongoDB automáticamente. No la creamos nosotros.
- `nombre` es obligatorio.
- `nombre` debe ser único en la colección (dos usuarios no pueden llamarse igual) para que el login funcione.
- No hay email, no hay contraseña, no hay rol, no hay avatar en esta colección.
- El avatar puede seguir viviendo en `localStorage` del navegador, igual que en la entrega 1.

**Ejemplo de documento:**
```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c0d",
  "nombre": "Jordyn"
}
```

---

### Colección `rutinas`

Representa las rutinas disponibles en la aplicación. Sustituye progresivamente al array `getHabitosIniciales()` que en la entrega 1 estaba escrito a mano dentro de `HabitosService`.

```js
{
  _id: ObjectId,
  nombreRutina: String,
  imagenPortada: String,
  color: String,
  momento: String,      // "manana" | "mediodia" | "noche"
  tipoDia: String,      // "semana" | "finde" | "ambos"
  pasos: [
    {
      orden: Number,
      texto: String,
      imagen: String
    }
  ]
}
```

**Explicaciones:**
- `nombreRutina` es el nombre que ve el usuario en la tarjeta (ej: "Lavar las manos").
- `imagenPortada` es la ruta relativa a la imagen de portada de la tarjeta (ej: `/assets/images/lavar-manos-cover.png`).
- `color` es el color de fondo de la tarjeta en formato hexadecimal (ej: `#f0f0f0`).
- `momento` determina en qué pantalla de momento del día aparece esta rutina.
- `tipoDia` determina si la rutina aparece en días de semana, fines de semana, o siempre.
- `pasos` es un array de pasos embebido dentro del documento de la rutina. Se embebe porque los pasos siempre se consultan junto con la rutina, nunca por separado.
- `orden` dentro de cada paso indica la secuencia en la que deben mostrarse.

**Ejemplo de documento:**
```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c01",
  "nombreRutina": "Lavar las manos",
  "imagenPortada": "/assets/images/lavar-manos-cover.png",
  "color": "#f0f0f0",
  "momento": "manana",
  "tipoDia": "ambos",
  "pasos": [
    { "orden": 1, "texto": "Abrir el grifo", "imagen": "/assets/images/abrir-grifo.png" },
    { "orden": 2, "texto": "Mojar las manos", "imagen": "/assets/images/lavar-manos-cover.png" },
    { "orden": 3, "texto": "Frotar con jabón", "imagen": "/assets/images/echar-jabon.png" },
    { "orden": 4, "texto": "Cerrar el grifo", "imagen": "/assets/images/cerrar-grifo.png" },
    { "orden": 5, "texto": "Secar las manos", "imagen": "/assets/images/secar-manos.png" }
  ]
}
```

---

### Colección `usuarioRutinas`

Esta colección es el corazón de la nueva funcionalidad. Relaciona qué rutinas tiene asignadas cada usuario y guarda si las ha completado.

```js
{
  _id: ObjectId,
  usuarioId: ObjectId,           // referencia al _id del documento en 'usuarios'
  rutinaId: ObjectId,            // referencia al _id del documento en 'rutinas'
  completada: Boolean,           // false por defecto, true cuando el usuario la completa
  fechaAsignacion: Date,         // cuándo se le asignó esta rutina al usuario
  fechaUltimaCompletada: Date    // cuándo la completó por última vez (null si nunca)
}
```

**Por qué existe esta colección:**

En la entrega 1, todos los usuarios veían exactamente las mismas rutinas porque estaban hardcodeadas en el código. Con esta colección, cada usuario tiene su propio conjunto de rutinas asignadas. Una misma rutina puede estar asignada a varios usuarios a la vez, y cada usuario tiene su propio estado `completada`.

Esto funciona igual que una **tabla intermedia muchos-a-muchos en SQL**. En SQL se llamaría tabla de unión. En MongoDB es una colección de documentos de relación.

**Ejemplo:**

| usuarioId | rutinaId | completada |
|---|---|---|
| (id de Jordyn) | (id de "Lavar las manos") | false |
| (id de Jordyn) | (id de "Hacer la cama") | true |
| (id de Carlos) | (id de "Preparar la mesa") | false |
| (id de Carlos) | (id de "Lavar las manos") | false |

En este ejemplo:
- Jordyn tiene asignadas "Lavar las manos" y "Hacer la cama".
- Carlos tiene asignadas "Preparar la mesa" y "Lavar las manos".
- "Lavar las manos" está asignada a ambos usuarios, pero cada uno tiene su propio estado de completado.

**Ejemplo de documento:**
```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c10",
  "usuarioId": "664f1a2b3c4d5e6f7a8b9c0d",
  "rutinaId": "664f1a2b3c4d5e6f7a8b9c01",
  "completada": false,
  "fechaAsignacion": "2025-04-01T00:00:00.000Z",
  "fechaUltimaCompletada": null
}
```

---

## Nueva pantalla de login

Antes de poder ver las rutinas, el usuario debe identificarse. La nueva pantalla de inicio reemplaza a la actual pantalla de selección de momento del día.

**Comportamiento:**
1. El usuario ve un campo de texto y un botón "Entrar".
2. Escribe su nombre (ej: "Jordyn") y pulsa el botón.
3. Angular envía el nombre al backend mediante una petición POST.
4. El backend busca ese nombre en la colección `usuarios` de MongoDB.
5. Si el nombre existe, el backend devuelve los datos del usuario (su `_id` y `nombre`).
6. Angular guarda esos datos en `localStorage` y navega a la pantalla de selección de momento.
7. Si el nombre no existe en la base de datos, se muestra un mensaje de error sencillo ("Usuario no encontrado. Comprueba tu nombre.").

**Por qué no hay contraseña:**
Los usuarios de FUVI son personas con posibles dificultades cognitivas. Pedir una contraseña sería una barrera de accesibilidad. El nombre es suficiente para identificar quién está usando la app.

**Cómo se protegen las rutas:**
Angular guarda en `localStorage` el objeto del usuario después del login. Si alguien intenta acceder directamente a `/rutinas/manana` sin haber hecho login (es decir, sin tener el usuario guardado en `localStorage`), un **guard de Angular** lo redirige automáticamente al login. Cuando el usuario sale de la app, se elimina el dato de `localStorage` y la próxima vez que abra la app deberá identificarse de nuevo.

---

## API REST del backend

El backend expone los siguientes endpoints. Angular los llamará usando `HttpClient`.

### Login

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| POST | `/api/login` | `{ "nombre": "Jordyn" }` | `{ "_id": "...", "nombre": "Jordyn" }` o error 404 |

### Rutinas del usuario

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios/:id/rutinas` | Devuelve todas las rutinas asignadas al usuario con su estado `completada` |
| PATCH | `/api/usuarios/:id/rutinas/:rutinaId/completar` | Marca una rutina como completada para ese usuario |
| POST | `/api/usuarios/:id/rutinas/reiniciar` | Pone `completada: false` en todas las rutinas del usuario |

### Rutinas (detalle)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/rutinas/:id` | Devuelve una rutina concreta con todos sus pasos |

**Nota sobre el filtrado por momento del día:**
El filtrado por `momento` y `tipoDia` puede hacerse en el backend (pasando query params como `/api/usuarios/:id/rutinas?momento=manana`) o en el propio Angular después de recibir todas las rutinas. Para mantener los cambios en Angular al mínimo, es recomendable que Angular reciba todas las rutinas del usuario y aplique el mismo filtro que ya existía en `HabitosService`.

**Nota sobre el populate:**
Cuando el backend responde a `GET /api/usuarios/:id/rutinas`, tiene que devolver los datos completos de cada rutina (nombre, imagen, color, momento, tipoDia, pasos), no solo el `rutinaId`. Mongoose tiene una función llamada `populate()` que hace esto automáticamente: busca el documento de rutina referenciado por cada `rutinaId` y lo inserta en la respuesta.

---

## Estructura de carpetas del backend

```
backend/
├── config/
│   └── db.js                  → Conexión a MongoDB Atlas con Mongoose
├── models/
│   ├── Usuario.js             → Schema de Mongoose para la colección 'usuarios'
│   ├── Rutina.js              → Schema de Mongoose para la colección 'rutinas'
│   └── UsuarioRutina.js       → Schema de Mongoose para la colección 'usuarioRutinas'
├── routes/
│   ├── auth.routes.js         → POST /api/login
│   ├── usuarios.routes.js     → GET /rutinas, PATCH /completar, POST /reiniciar
│   └── rutinas.routes.js      → GET /api/rutinas/:id
├── controllers/
│   ├── auth.controller.js     → Lógica de login (buscar usuario por nombre)
│   ├── usuarios.controller.js → Lógica de rutinas del usuario
│   └── rutinas.controller.js  → Lógica de detalle de rutina
├── seed.js                    → Script para poblar la BD con usuarios y rutinas iniciales
├── app.js                     → Configura Express: middlewares globales, CORS, rutas
├── server.js                  → Punto de entrada: conecta BD y arranca el servidor
├── .env                       → Variables de entorno (URI de Atlas, PORT)
└── package.json
```

---

## Fases de implementación

Lo que sigue es el plan paso a paso para construir todo esto. Cada fase produce algo funcional que se puede probar de forma independiente antes de pasar a la siguiente.

---

### Fase 1 – Preparar la base de datos en MongoDB Atlas (HECHO)

**Objetivo:** Tener una base de datos `fuvi` en Atlas lista para recibir datos.

**Pasos:**
1. Acceder al cluster ya existente en MongoDB Atlas (`spwivanzhengupsa.jy9zrb9.mongodb.net`).
2. Crear una nueva base de datos llamada `fuvi` (o dejar que Mongoose la cree automáticamente al primer insert).
3. En "Network Access", confirmar que la IP `0.0.0.0/0` está añadida para permitir conexiones desde cualquier origen.
4. Verificar que las credenciales del cluster son accesibles: usuario `dbIvanZhengSPW`.

**Resultado esperado:** La base de datos `fuvi` existe en Atlas (aunque esté vacía) y se puede conectar con la cadena de conexión.

---

### Fase 2 – Crear el backend con Node.js y Express (HECHO)

**Objetivo:** Tener un servidor Express arrancando localmente y conectado a MongoDB Atlas.

**Pasos:**
1. Crear la carpeta `backend/` dentro del repositorio del proyecto.
2. Dentro de `backend/`, inicializar un proyecto Node: `npm init -y`.
3. Instalar las dependencias:
   ```
   npm install express mongoose dotenv cors
   npm install --save-dev nodemon
   ```
4. Crear el archivo `.env` en la raíz de `backend/` con el siguiente contenido:
   ```
   MONGO_URI=mongodb+srv://dbIvanZhengSPW:Lavender1314@spwivanzhengupsa.jy9zrb9.mongodb.net/fuvi
   PORT=3000
   ```
5. Crear `config/db.js` con la conexión a Mongoose usando `process.env.MONGO_URI`.
6. Crear `app.js` configurando Express con el middleware de CORS y los routers.
7. Crear `server.js` que llama a `db.js` y luego arranca el servidor en el puerto indicado por `.env`.
8. Añadir al `package.json` el script: `"dev": "nodemon server.js"`.
9. Ejecutar `npm run dev` y verificar en la consola que aparece el mensaje de conexión exitosa a Atlas.

**Resultado esperado:** El servidor arranca en `http://localhost:3000` y muestra "Conectado a MongoDB Atlas" en la consola.

---

### Fase 3 – Definir los schemas de Mongoose

**Objetivo:** Crear los tres modelos de datos que representan las colecciones en MongoDB.

**Pasos:**
1. Crear `models/Usuario.js` con el schema: `nombre` (String, required, unique).
2. Crear `models/Rutina.js` con el schema: `nombreRutina`, `imagenPortada`, `color`, `momento` (enum), `tipoDia` (enum), `pasos` (array de subdocumentos con `orden`, `texto`, `imagen`).
3. Crear `models/UsuarioRutina.js` con el schema: `usuarioId` (ObjectId, ref: 'Usuario'), `rutinaId` (ObjectId, ref: 'Rutina'), `completada` (Boolean, default: false), `fechaAsignacion` (Date, default: Date.now), `fechaUltimaCompletada` (Date, default: null).
4. Verificar que los tres modelos se pueden importar desde `app.js` sin errores.

**Resultado esperado:** Tres archivos de modelo creados. Sin errores al arrancar el servidor.

---

### Fase 4 – Poblar la base de datos con datos iniciales (seed) (HECHO)

**Objetivo:** Crear los usuarios y rutinas de partida directamente en MongoDB, de modo que la app tenga datos con los que funcionar desde el primer día.

**Pasos:**
1. Crear `seed.js` en la raíz de `backend/`.
2. El script debe:
   - Conectarse a Atlas.
   - Borrar los documentos existentes en las tres colecciones (para poder ejecutarlo varias veces sin duplicados).
   - Insertar los usuarios (ej: Jordyn y cualquier otro usuario que se quiera).
   - Insertar las 9 rutinas (las mismas que estaban en `getHabitosIniciales()` de Angular, adaptando los campos al nuevo schema).
   - Insertar los documentos de `usuarioRutinas` que relacionan cada usuario con las rutinas que se le quieren asignar.
   - Cerrar la conexión al terminar.
3. Ejecutar el script: `node seed.js`.
4. Verificar en MongoDB Atlas (en la interfaz web de Atlas → Browse Collections) que las tres colecciones existen y tienen documentos.

**Resultado esperado:** MongoDB Atlas tiene datos reales. Se pueden ver en la interfaz de Atlas.

---

### Fase 5 – Crear las rutas y controladores del backend (HECHO)

**Objetivo:** El backend responde correctamente a las peticiones que luego hará Angular.

**Pasos, en este orden:**

**5.1 – Login**
1. Crear `routes/auth.routes.js` con `POST /api/login`.
2. Crear `auth.controller.js` con la lógica: recibir `{ nombre }` en el body, buscar en la colección `usuarios` con `Usuario.findOne({ nombre })`, devolver el documento si existe o error 404 si no.
3. Probar con Postman o Thunder Client: `POST http://localhost:3000/api/login` con body `{ "nombre": "Jordyn" }`. Debe devolver el documento del usuario.

**5.2 – Rutinas del usuario**
1. Crear `routes/usuarios.routes.js`.
2. Endpoint `GET /api/usuarios/:id/rutinas`:
   - Buscar en `UsuarioRutina` todos los documentos donde `usuarioId` coincida con `:id`.
   - Usar `.populate('rutinaId')` para que Mongoose incluya todos los campos de la rutina en la respuesta.
   - Devolver un array con los datos combinados (estado `completada` + datos completos de la rutina).
3. Endpoint `PATCH /api/usuarios/:id/rutinas/:rutinaId/completar`:
   - Buscar el documento en `UsuarioRutina` con el `usuarioId` y `rutinaId` indicados.
   - Actualizar `completada: true` y `fechaUltimaCompletada: new Date()`.
4. Endpoint `POST /api/usuarios/:id/rutinas/reiniciar`:
   - Buscar todos los documentos de `UsuarioRutina` del usuario.
   - Poner `completada: false` y `fechaUltimaCompletada: null` en todos ellos.
5. Probar cada endpoint con Postman.

**5.3 – Detalle de rutina**
1. Crear `routes/rutinas.routes.js` con `GET /api/rutinas/:id`.
2. Lógica: `Rutina.findById(req.params.id)`.
3. Probar con Postman.

**Resultado esperado:** Los tres endpoints responden correctamente con datos reales de MongoDB.

---

### Fase 6 – Modificar el frontend Angular (HECHO)

**Objetivo:** Angular consume la API del backend en lugar de los datos locales.

Esta es la fase que más toca el código existente, pero los cambios están bien delimitados. Se trabaja de lo más simple a lo más complejo.

**6.1 – Archivo de entorno**

Crear (o modificar si ya existe) `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

Este archivo concentra la URL del backend. Cuando se despliegue en producción, se usará `environment.production.ts` con la URL real del servidor.

**6.2 – Nueva pantalla de login**

1. Crear un nuevo componente Angular en `src/app/auth/paginas/login/`.
2. La pantalla tiene: un campo de texto para el nombre, un botón "Entrar", y un mensaje de error opcional.
3. Al pulsar "Entrar", llama al backend con `HttpClient.post('/api/login', { nombre })`.
4. Si la respuesta es un usuario válido, se guarda en `localStorage` con clave `fuvi_usuario`: `{ _id: "...", nombre: "Jordyn" }`.
5. Luego navega programáticamente a `/inicio` (la pantalla de selección de momento).
6. Si el backend devuelve error 404, se muestra el mensaje de error.
7. Añadir la ruta `/login` en `app.routes.ts` apuntando al nuevo componente.
8. Cambiar la ruta `/` para que redirija a `/login`.
9. Renombrar la ruta de la pantalla de selección de momento a `/inicio`.

**6.3 – Guard de rutas**

1. Crear un guard Angular (`AuthGuard`) que compruebe si `localStorage` tiene el dato `fuvi_usuario`.
2. Si existe, deja pasar. Si no existe, redirige a `/login`.
3. Aplicar el guard a todas las rutas excepto `/login`.

De este modo, si alguien intenta acceder a `/inicio` directamente sin haber hecho login, es redirigido automáticamente.

**6.4 – Refactorizar HabitosService → RutinasService**

Este es el cambio más importante en Angular. El servicio deja de tener los datos hardcodeados y pasa a pedirlos al backend.

1. Crear `src/app/core/services/rutinas.service.ts` (puede renombrar o extender `habitos.service.ts`).
2. Al inicializar el servicio (o cuando el componente de rutinas lo necesite), llamar a `GET /api/usuarios/:id/rutinas` usando el `_id` guardado en `localStorage`.
3. La respuesta del backend devuelve un array de rutinas con su estado `completada`. Guardar ese array en un signal de Angular.
4. Los componentes existentes (`rutinas-momento`, `tarjeta-habito`, etc.) recibirán los datos del signal igual que antes, sin necesitar cambios internos en los componentes de presentación.
5. El método `completarHabito()` ahora debe:
   - Actualizar el signal local inmediatamente (para que la UI responda al instante).
   - Llamar en segundo plano a `PATCH /api/usuarios/:id/rutinas/:rutinaId/completar`.
6. El método `reiniciarHabitos()` debe:
   - Llamar a `POST /api/usuarios/:id/rutinas/reiniciar`.
   - Al recibir confirmación, recargar las rutinas del usuario desde el backend.

**6.5 – Filtrado por momento del día**

Este filtrado no cambia. El método `getHabitosPorMomento()` (o su equivalente renombrado) sigue funcionando igual: recibe el array de rutinas del usuario y filtra por `momento` y `tipoDia`. La única diferencia es que ahora el array viene del backend en lugar de estar escrito en el código.

**6.6 – Detalle de rutina**

El componente `detalle-habito` actualmente recibe el id de la rutina por la URL y lo busca en el service. En la nueva versión, si los datos de las rutinas ya están cargados en el signal del servicio, puede buscarlos directamente ahí sin hacer una petición adicional. Si se prefiere, puede llamar a `GET /api/rutinas/:id` para obtener el detalle con todos sus pasos.

**Resultado esperado:** La aplicación Angular arranca en `/login`, el usuario escribe su nombre, accede a sus rutinas personalizadas, puede completarlas y reiniciarlas, y todos los cambios se guardan en MongoDB.

---

### Fase 7 – Despliegue

**Objetivo:** Que la aplicación funcione de forma pública en internet.

**7.1 – Desplegar el backend en Render.com**

Render es un servicio gratuito para desplegar servidores Node.js.

1. Subir la carpeta `backend/` a un repositorio de GitHub (puede ser el mismo repo del proyecto o uno separado).
2. Crear una cuenta en Render y añadir un nuevo "Web Service".
3. Conectar el repositorio de GitHub.
4. Configurar:
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
5. Añadir las variables de entorno en el panel de Render:
   - `MONGO_URI` → la cadena de conexión completa de Atlas
   - `PORT` → 3000 (o dejar que Render lo asigne automáticamente)
6. Render desplegará el servidor y asignará una URL pública del tipo `https://fuvi-backend.onrender.com`.
7. Verificar que `https://fuvi-backend.onrender.com/api/login` responde (aunque sea con error 405 por GET, confirma que el servidor está activo).

**7.2 – Actualizar el frontend para producción**

1. Crear `src/environments/environment.production.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://fuvi-backend.onrender.com/api'
   };
   ```
2. Compilar el proyecto Angular para producción: `ng build --configuration production`. Genera la carpeta `dist/`.

**7.3 – Desplegar el frontend**

**Opción A – Netlify (recomendada por simplicidad):**
1. Ir a [netlify.com](https://netlify.com) y crear una cuenta.
2. Arrastrar la carpeta `dist/fuvi/browser/` (la carpeta generada por Angular) a la interfaz de Netlify Drop.
3. Netlify asigna una URL pública automáticamente.
4. Configurar en Netlify un archivo `_redirects` para que las rutas de Angular funcionen correctamente: `/* /index.html 200`.

**Opción B – Servir el frontend desde Express:**
- Express puede servir los archivos estáticos de Angular usando `express.static()`.
- Esto elimina el problema de CORS porque frontend y backend comparten el mismo dominio.
- Solo es necesario un único servidor en Render, que sirve tanto la API como el frontend.

**7.4 – Verificar el sistema completo en producción**

1. Abrir la URL pública en un dispositivo móvil.
2. Escribir el nombre "Jordyn" en el login → acceder a las rutinas.
3. Completar una rutina → verificar en MongoDB Atlas que el campo `completada` cambió a `true`.
4. Reiniciar → verificar que `completada` vuelve a `false`.
5. Escribir un nombre que no existe → verificar que aparece el mensaje de error.

---

## Resumen de cambios por archivo

### Archivos nuevos en el backend

| Archivo | Qué hace |
|---|---|
| `backend/server.js` | Punto de entrada, arranca el servidor |
| `backend/app.js` | Configura Express, CORS y registra las rutas |
| `backend/config/db.js` | Conexión a MongoDB Atlas con Mongoose |
| `backend/models/Usuario.js` | Schema de usuarios |
| `backend/models/Rutina.js` | Schema de rutinas con pasos embebidos |
| `backend/models/UsuarioRutina.js` | Schema de relación usuario-rutina |
| `backend/routes/auth.routes.js` | Ruta de login |
| `backend/routes/usuarios.routes.js` | Rutas de rutinas del usuario |
| `backend/routes/rutinas.routes.js` | Ruta de detalle de rutina |
| `backend/controllers/*.js` | Lógica de cada ruta |
| `backend/seed.js` | Pobla la BD con datos iniciales |
| `backend/.env` | Variables de entorno (no subir a GitHub) |

### Archivos modificados en Angular

| Archivo | Qué cambia |
|---|---|
| `app.routes.ts` | Añadir ruta `/login`, renombrar `/` a `/inicio`, añadir guard |
| `core/services/habitos.service.ts` | Pasa a leer rutinas del backend en lugar de datos locales |
| `environments/environment.ts` | Añadir `apiUrl` con la URL del backend local |
| `environments/environment.production.ts` | Añadir `apiUrl` con la URL del backend en producción |

### Archivos nuevos en Angular

| Archivo | Qué hace |
|---|---|
| `auth/paginas/login/login.ts` | Componente de la pantalla de login |
| `auth/paginas/login/login.html` | Plantilla del formulario de login |
| `auth/paginas/login/login.css` | Estilos del login |
| `core/guards/auth.guard.ts` | Protege las rutas que requieren login |

### Archivos que NO cambian

Todos los componentes de presentación existentes (cabecera, tarjeta de rutina, barra de progreso, detalle de paso, celebración) se mantienen exactamente igual. El diseño visual, los pictogramas, los sonidos y la lógica de pasos no necesitan modificarse.

---

## Notas finales

- **El archivo `.env` nunca debe subirse a GitHub.** Añadirlo al `.gitignore` del backend.
- **El script `seed.js` solo se ejecuta una vez.** Si se ejecuta de nuevo borrará los datos existentes y los recreará desde cero.
- **La implementación real actual usa el driver oficial de MongoDB** y resuelve la unión usuario-rutina con `$lookup`, sin Mongoose.
- **La URL del backend cambia entre desarrollo y producción.** Por eso se usan los archivos de `environment.ts`: Angular elige automáticamente cuál usar según si compilamos con `ng serve` (desarrollo) o `ng build --configuration production`.
- **El avatar ya se guarda en MongoDB** y la sesión del usuario también se recupera desde MongoDB.

---

## Siguientes pasos

1. Añadir registros de actividad y abandonos por rutina.
2. Diseñar la parte de administración y estadísticas.
3. Preparar despliegue y pruebas finales de integración.

## Pruebas realizadas

- Seed ejecutado y usuarios/rutinas cargados en MongoDB Atlas.
- Login real por nombre, carga de sesión desde MongoDB y logout.
- Carga de rutinas del usuario, cambio de avatar, completar y reiniciar rutinas.
- Verificación de que ya no quedan usos de `localStorage` en frontend ni backend.
