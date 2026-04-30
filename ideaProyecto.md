# FUVI – Idea de ampliación con Node.js, Express y MongoDB

> Estado actual breve: la implementación real ya tiene backend Node.js + Express, MongoDB Atlas, seed, login simple por nombre, rutas protegidas, avatar guardado en MongoDB y sesión persistida en MongoDB. No se ha implementado todavía la parte de admin/JWT/estadísticas de esta idea original.

## Contexto y motivación

La primera entrega de FUVI funciona bien como app de usuario único con datos locales. Sin embargo, en un contexto real (una residencia, un centro escolar, una familia) hay varias personas usando la misma app, y alguien necesita supervisarlas: un terapeuta, un educador, un familiar. Para eso introducimos el **rol de administrador**.

La idea es extender la app sin romper lo que ya funciona: el usuario sigue viendo la misma experiencia, pero ahora sus datos viajan a un servidor y se guardan en una base de datos real. El administrador tiene su propio acceso desde donde puede ver estadísticas completas y gestionar los hábitos disponibles.

---

## Arquitectura general

Pasamos de una app de una sola capa a una arquitectura de tres capas:

```
┌─────────────────────────────────┐
│         FRONTEND (Angular)      │  ← Lo que ya tenemos (+ pantalla de selección de usuario + vista admin)
└────────────────┬────────────────┘
                 │ HTTP / REST API
┌────────────────▼────────────────┐
│      BACKEND (Node + Express)   │  ← Nuevo: servidor con rutas y lógica de negocio
└────────────────┬────────────────┘
                 │ Mongoose (ODM)
┌────────────────▼────────────────┐
│   BASE DE DATOS (MongoDB Atlas) │  ← Nuevo: persistencia real de usuarios y datos
└─────────────────────────────────┘
```

El frontend Angular sigue siendo una SPA que se sirve de forma estática. El backend Express expone una API REST que el frontend consume. MongoDB Atlas guarda todos los datos en la nube.

---

## ¿Qué es Mongoose?

Mongoose es una librería de Node.js que actúa como puente entre el código JavaScript y MongoDB. Sin Mongoose, habría que escribir consultas en el lenguaje propio de Mongo, que es verbose y difícil de mantener. Con Mongoose se definen **schemas** (esquemas), que son como plantillas que describen cómo tiene que ser cada documento antes de guardarlo. Luego Mongoose convierte esos schemas en objetos JavaScript normales con los que trabajar.

La analogía más directa: si MongoDB es la base de datos y Node.js es el código, Mongoose es el ORM/ODM que los conecta (equivalente a lo que sería Sequelize con MySQL, por ejemplo).

La conexión con nuestro cluster de Atlas tiene este formato, usando las credenciales del proyecto:

mongoose.connect(MONGO_URI_ATLAS)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err))
```

Esto va en el archivo `config/db.js` del backend y se llama una sola vez al arrancar el servidor.

---

## Roles y usuarios

### Decisión de diseño: sin contraseñas para usuarios

Los usuarios de FUVI son personas con dificultades cognitivas. Pedirles una contraseña es una barrera innecesaria que va en contra de la accesibilidad de la app. Por eso, el **acceso de usuario es solo por nombre**: la pantalla de inicio muestra quién está disponible y el usuario simplemente pulsa su nombre o avatar.

Para el **administrador**, sí tiene sentido una contraseña corta (o un PIN numérico) ya que es una persona sin esas dificultades y necesita proteger el acceso al panel de datos.

### Usuarios del sistema (fijos, creados por nosotros)

No habrá formulario de registro público. Los dos usuarios se crean directamente en la base de datos al hacer el despliegue inicial (mediante un script de seed o desde MongoDB Atlas directamente):

- **Jordyn** – rol `usuario`, avatar a elegir
- **Admin** – rol `admin`, con contraseña

Si en el futuro se quisiera añadir más usuarios, el administrador los crearía desde el panel, no habría auto-registro.

### Usuario (Jordyn)
- Entra pulsando su nombre/avatar en la pantalla de inicio (sin contraseña)
- Ve sus rutinas filtradas por momento del día como antes
- Cada vez que completa un paso, la app registra el tiempo que tardó en ese paso
- Si abandona a mitad de tarea, también se guarda ese abandono con en qué paso paró
- Al completar un hábito, se envía todo el registro al backend
- La experiencia visual no cambia respecto a la entrega 1

### Administrador
- Accede con su nombre ("Admin") + contraseña/PIN desde una ruta separada
- Puede ver una lista de todos los usuarios
- Al seleccionar un usuario, ve sus estadísticas de cada hábito:
  - Número de veces completado
  - Número de abandonos y en qué paso ocurrieron
  - Tiempo medio por paso
  - Tiempo total medio
  - Última vez completado
- Puede activar o desactivar hábitos (uno desactivado no aparece a Jordyn)
- Puede eliminar hábitos que ya no se quieran usar
- *(Línea futura)* Añadir nuevos hábitos con sus pasos

---

## Modelo de datos en MongoDB

MongoDB guarda datos en colecciones de documentos JSON. Necesitamos tres colecciones.

### Colección `usuarios`

Sin email, sin contraseña para el rol `usuario`. Solo lo imprescindible:

```json
{
  "_id": "ObjectId generado por Mongo",
  "nombre": "Jordyn",
  "rol": "usuario",
  "avatar": "female",
  "creadoEn": "2025-02-10T09:00:00Z"
}
```

Para el admin, el documento incluye un campo extra con la contraseña hasheada:

```json
{
  "_id": "ObjectId",
  "nombre": "Admin",
  "rol": "admin",
  "password": "hash bcrypt del PIN o contraseña",
  "creadoEn": "2025-02-10T09:00:00Z"
}
```

El campo `rol` puede ser `"usuario"` o `"admin"`. Así controlamos en el backend qué puede hacer cada persona.

### Colección `habitos`

```json
{
  "_id": "ObjectId",
  "nombre": "Lavar las manos",
  "imagenPortada": "lavado-manos.png",
  "color": "#d4f1f4",
  "momento": "manana",
  "tipoDia": "ambos",
  "activo": true,
  "pasos": [
    { "orden": 1, "texto": "Abre el grifo del agua", "imagen": "paso1.png" },
    { "orden": 2, "texto": "Moja las manos", "imagen": "paso2.png" },
    { "orden": 3, "texto": "Echa jabón y frota", "imagen": "paso3.png" }
  ],
  "creadoEn": "2025-01-01T00:00:00Z"
}
```

El campo `activo` permite al admin ocultar un hábito sin borrarlo. Los `pasos` son un array embebido dentro del hábito porque siempre se consultan juntos.

### Colección `registros`

Esta es la pieza central de los datos del admin. Se guarda **tanto cuando se completa un hábito como cuando se abandona**. El campo `completado` distingue los dos casos:

```json
{
  "_id": "ObjectId",
  "usuarioId": { "$ref": "usuarios", "_id": "ObjectId del usuario" },
  "habitoId":  { "$ref": "habitos",  "_id": "ObjectId del hábito"  },
  "completado": true,
  "fechaInicio": "2025-04-28T08:10:00Z",
  "fechaFin": "2025-04-28T08:14:30Z",
  "tiempoTotalSegundos": 270,
  "pasoEnElQueAbandonó": null,
  "tiempoPorPaso": [
    { "numeroPaso": 1, "tiempoSegundos": 45 },
    { "numeroPaso": 2, "tiempoSegundos": 60 },
    { "numeroPaso": 3, "tiempoSegundos": 165 }
  ]
}
```

Si Jordyn abandona en el paso 2:

```json
{
  "completado": false,
  "pasoEnElQueAbandonó": 2,
  "fechaFin": "2025-04-28T08:12:00Z",
  "tiempoPorPaso": [
    { "numeroPaso": 1, "tiempoSegundos": 45 },
    { "numeroPaso": 2, "tiempoSegundos": 75 }
  ]
}
```

**Sobre los JOINs en MongoDB**: MongoDB no tiene JOINs como SQL, pero Mongoose tiene una función llamada `populate()` que hace exactamente lo mismo. En lugar de guardar solo el ObjectId del usuario, Mongoose puede "rellenar" ese campo con el documento completo del usuario (su nombre, avatar, etc.) automáticamente al hacer la consulta. Así el admin ve nombres reales en las estadísticas, no IDs crípticos.

```javascript
// Ejemplo de cómo quedaría la consulta con populate en el backend:
const registros = await Registro.find({ usuarioId: id })
  .populate('usuarioId', 'nombre avatar')   // trae nombre y avatar del usuario
  .populate('habitoId', 'nombre color')     // trae nombre y color del hábito
```

---

## API REST (endpoints de Express)

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/usuarios` | Devuelve la lista de usuarios disponibles (para mostrar en la pantalla de inicio) |
| POST | `/api/auth/login` | Login de usuario (solo nombre) o admin (nombre + contraseña). Devuelve un token JWT |

No hay endpoint de registro público. Los usuarios se crean directamente en la base de datos.

### Hábitos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/habitos` | Lista todos los hábitos activos (para Jordyn) |
| GET | `/api/habitos/:id` | Devuelve un hábito con sus pasos |
| PUT | `/api/habitos/:id` | Activa o desactiva un hábito (solo admin) |
| DELETE | `/api/habitos/:id` | Elimina un hábito permanentemente (solo admin) |

*(Línea futura)* POST `/api/habitos` para crear nuevos hábitos desde el panel admin.

### Registros

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/registros` | Guarda un registro (completado o abandono) |
| GET | `/api/registros/usuario/:id` | Todos los registros de un usuario, con populate de nombres (solo admin) |
| GET | `/api/registros/habito/:id` | Todos los registros de un hábito concreto (solo admin) |

### Usuarios (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios` | Lista todos los usuarios |
| GET | `/api/usuarios/:id` | Datos y estadísticas resumidas de un usuario |

---

## Autenticación con JWT

JWT (JSON Web Token) es una cadena cifrada que el servidor genera cuando alguien hace login. Funciona así:

1. Jordyn pulsa su nombre → Angular manda `POST /api/auth/login` con `{ nombre: "Jordyn" }`
2. El servidor busca el usuario en Mongo, confirma que existe, y genera un token firmado con una clave secreta
3. Angular guarda ese token en `localStorage`
4. En cada petición posterior, Angular manda el token en la cabecera: `Authorization: Bearer <token>`
5. El backend tiene un middleware que lee ese token, lo verifica, y extrae quién es el usuario y cuál es su rol
6. Si el token es inválido o ha expirado → el servidor devuelve 401 y Angular redirige al inicio

Para el admin, el paso 1 incluye también la contraseña: `{ nombre: "Admin", password: "..." }`. El servidor verifica la contraseña con bcrypt antes de generar el token.

El campo `rol` va dentro del token, así el backend sabe automáticamente si puede acceder a rutas de admin sin hacer otra consulta a la base de datos.

---

## Cambios en el frontend Angular

Los cambios en Angular son contenidos y se pueden hacer sobre lo que ya existe:

1. **Pantalla "¿Quién eres?"**: Reemplaza la pantalla de inicio actual. Muestra los usuarios disponibles como tarjetas con avatar y nombre. Jordyn pulsa la suya y entra directamente. El admin tiene una opción separada (quizás más discreta) que pide contraseña.

2. **Interceptor HTTP**: Un servicio de Angular que añade automáticamente el token a todas las peticiones HTTP. Se configura una vez y funciona en toda la app.

3. **Guard de rutas**: Protege `/admin/...` para que solo sea accesible con rol `admin`, y el resto de rutas para que requieran estar autenticado.

4. **Temporizador en DetalleHabito**: Al entrar en un hábito, se inicia un timer. Cada vez que Jordyn pulsa "siguiente paso", se guarda el tiempo de ese paso en un array local. Al completar (o al pulsar "salir"), se manda todo al backend con POST `/api/registros`.

5. **Detección de abandono**: Si Jordyn navega hacia atrás o cierra el hábito antes de terminar, se guarda el registro con `completado: false` y el número del paso en el que estaba.

6. **Panel de administrador**: Vistas nuevas con:
   - Lista de usuarios con sus contadores generales
   - Vista de detalle de un usuario: tabla de hábitos con columnas de completados, abandonos, tiempo medio
   - Lista de hábitos con botón de activar/desactivar y eliminar

7. **HabitosService refactorizado**: En lugar de leer de `localStorage`, llama a `GET /api/habitos`. El localStorage puede mantenerse como caché para la sesión actual.

---

## Estructura de carpetas del backend

```
backend/
├── config/
│   └── db.js                → Conexión a MongoDB Atlas con Mongoose
├── models/
│   ├── Usuario.js           → Schema: nombre, rol, avatar, password (solo admin)
│   ├── Habito.js            → Schema: nombre, pasos, momento, tipoDia, activo
│   └── Registro.js          → Schema: usuarioId, habitoId, completado, tiempos, abandono
├── routes/
│   ├── auth.routes.js       → GET /usuarios, POST /login
│   ├── habitos.routes.js    → CRUD de hábitos
│   ├── registros.routes.js  → POST registro, GET estadísticas
│   └── usuarios.routes.js   → GET lista y detalle (admin)
├── controllers/
│   ├── auth.controller.js
│   ├── habitos.controller.js
│   ├── registros.controller.js
│   └── usuarios.controller.js
├── middleware/
│   ├── auth.middleware.js   → Verifica JWT en cada petición
│   └── admin.middleware.js  → Verifica que el rol sea "admin"
├── seed.js                  → Script para crear los dos usuarios iniciales en la BD
├── app.js                   → Configura Express: middlewares, rutas, CORS
├── server.js                → Punto de entrada: conecta BD y levanta el servidor
├── .env                     → Variables: cadena de conexión Atlas, JWT secret, PORT
└── package.json
```

---

## Flujo de despliegue paso a paso

### Paso 1 – La base de datos en Atlas ya está lista (HECHO)

Tenemos ya un cluster en MongoDB Atlas con las credenciales:
- Usuario: `dbIvanZhengSPW`
- Cluster: `spwivanzhengupsa.jy9zrb9.mongodb.net`

Solo hay que crear una nueva base de datos llamada `fuvi` dentro de ese cluster (se puede hacer desde la interfaz de Atlas o se crea automáticamente la primera vez que Mongoose conecta y guarda un documento).

Asegurarse de que en "Network Access" de Atlas esté permitida la IP `0.0.0.0/0` para que el servidor pueda conectarse desde cualquier sitio.

### Paso 2 – Crear y probar el backend en local (HECHO)

1. Crear la carpeta `backend/` dentro del proyecto
2. Inicializar con `npm init -y`
3. Instalar dependencias:
   ```bash
   npm install express mongoose dotenv bcryptjs jsonwebtoken cors
   npm install --save-dev nodemon
   ```
4. Crear el archivo `.env` con:
   ```
   MONGO_URI=mongodb+srv://dbIvanZhengSPW:Lavender1314@spwivanzhengupsa.jy9zrb9.mongodb.net/fuvi
   JWT_SECRET=fuvi_secret_2025
   PORT=3000
   ```
5. Programar los modelos, rutas y controladores
6. Ejecutar `node seed.js` para crear los dos usuarios en la base de datos
7. Probar los endpoints con Postman o Thunder Client antes de tocar el frontend

### Paso 3 – Ejecutar el seed de usuarios (HECHO)

El archivo `seed.js` crea los dos usuarios directamente en Mongo. Solo se ejecuta una vez:

```javascript
// seed.js (esquema de lo que haría)
// Crea usuario Jordyn (sin password) y usuario Admin (con password hasheado)
// Conecta a Atlas, inserta los documentos, y cierra la conexión
```

Desde ese momento la base de datos tiene los dos usuarios listos para usar.

### Paso 4 – Conectar el frontend al backend (HECHO)

1. Añadir en Angular un archivo `environment.ts`:
   ```typescript
   export const environment = {
     apiUrl: 'http://localhost:3000/api'
   };
   ```
2. Crear `AuthService` en Angular para gestionar login, logout y token
3. Crear el interceptor HTTP que añada el header de autorización automáticamente
4. Modificar `HabitosService` para que llame a la API en lugar de leer de localStorage
5. Añadir el temporizador en `DetalleHabito`

### Paso 5 – Desplegar el backend

La opción más sencilla y gratuita es **Render.com**:

1. Subir el backend a un repositorio de GitHub
2. Crear cuenta en Render y añadir un nuevo "Web Service"
3. Conectar el repositorio
4. Configurar:
   - Build command: `npm install`
   - Start command: `node server.js`
   - Variables de entorno: `MONGO_URI`, `JWT_SECRET`, `PORT`
5. Render asigna una URL del tipo `https://fuvi-backend.onrender.com`
6. Actualizar `environment.ts` en Angular para apuntar a esa URL

### Paso 6 – Desplegar el frontend

Una vez el backend está en Render:

**Opción A – Netlify** (la más fácil):
1. `ng build --configuration production` → genera la carpeta `dist/`
2. Arrastrar esa carpeta a Netlify Drop
3. Netlify da una URL pública en segundos

**Opción B – Servir desde el propio backend**:
- Express puede servir los archivos estáticos de Angular con `express.static()`
- Todo en el mismo servidor, sin problemas de CORS

### Paso 7 – Verificar el sistema completo

1. Abrir la app en el navegador → aparece la pantalla "¿Quién eres?" con Jordyn
2. Jordyn pulsa su avatar → entra a las rutinas del día
3. Completa un hábito → verificar en MongoDB Atlas que aparece un documento en la colección `registros` con `completado: true`
4. Abandona un hábito a medias → verificar que aparece otro documento con `completado: false`
5. Entrar como Admin → ver las estadísticas de Jordyn con nombres en lugar de IDs (gracias al populate)
6. Desactivar un hábito desde el panel admin → verificar que ya no le aparece a Jordyn

---

## Resumen de prioridades de implementación

El orden lógico para no bloquearse:

1. **Montar el backend básico**: conexión a Atlas con Mongoose, los tres modelos de datos
2. **Seed de usuarios**: crear Jordyn y Admin en la base de datos
3. **Login y JWT**: endpoint de login, middleware de verificación, guards en Angular
4. **Migrar hábitos**: que Angular los lea de la API en lugar de tenerlos hardcodeados
5. **Temporizador y registros**: añadir el timer en DetalleHabito y guardar completados/abandonos
6. **Panel de admin**: vistas de estadísticas en Angular con populate para ver nombres reales
7. **Despliegue**: backend en Render, frontend en Netlify o en el propio Render

---

## Siguientes pasos

1. Implementar persistencia de registros de uso y abandonos.
2. Construir la parte de administración y estadísticas.
3. Preparar despliegue de backend y frontend.

## Pruebas realizadas

- Login real contra MongoDB Atlas con usuarios del seed.
- Carga de rutinas por usuario desde backend.
- Cambio de avatar, completar rutina, reiniciar rutinas y cierre de sesión.
- Eliminación de `localStorage` y uso de sesión persistida en MongoDB.
