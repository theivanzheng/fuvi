# FUVI – Backend

Backend API REST para la aplicación FUVI. Construido con Node.js, Express y MongoDB Atlas.

## Cómo ejecutar

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Poblar la base de datos (solo la primera vez)

```bash
node seed.js
```

Esto inserta en MongoDB Atlas los usuarios iniciales, las 9 rutinas y las asignaciones usuario-rutina. Si se ejecuta de nuevo, borra los datos anteriores y los recrea desde cero.

### 3. Arrancar el servidor

```bash
npm run serve    # desarrollo (nodemon, se reinicia al guardar)
npm start        # producción (node directo)
```

El servidor escucha en `http://localhost:3000`.

---

## Estructura de carpetas

```
backend/
├── index.js                  → Punto de entrada del servidor
├── lib/
│   └── mongo.js              → Clase MongoLib: conexión y operaciones con Atlas
├── rutas/
│   ├── usuarios.js           → Rutas de login y de rutinas por usuario
│   └── rutinas.js            → Rutas de listado y detalle de rutinas
├── servicios/
│   ├── usuariosService.js    → Lógica de negocio de usuarios
│   └── rutinasService.js     → Lógica de negocio de rutinas
├── seed.js                   → Script de inicialización de datos en Atlas
├── .env                      → Variables de entorno (no subir a GitHub)
└── .gitignore
```

---

## Variables de entorno

El archivo `.env` debe estar en la raíz de `backend/` con este formato:

```
PORT=3000
DB_USER=tu_usuario_atlas
DB_PASSWORD=tu_contraseña_atlas
DB_NAME=fuvi
```

El archivo `.env` está en `.gitignore` y **no se sube al repositorio**.

---

## Dependencias

| Paquete | Uso |
|---|---|
| `express` | Servidor HTTP y definición de rutas |
| `mongodb` | Driver oficial de MongoDB para Node.js |
| `dotenv` | Carga las variables de entorno desde `.env` |
| `cors` | Permite peticiones desde Angular (distinto puerto) |
| `nodemon` *(dev)* | Reinicia el servidor automáticamente al guardar cambios |

---

## Colecciones en MongoDB Atlas

El proyecto usa la base de datos `fuvi` con tres colecciones:

### `usuarios`
Personas que pueden entrar en la app. Solo tienen nombre.

```json
{ "_id": "ObjectId", "nombre": "Jordyn" }
```

### `rutinas`
Las rutinas disponibles con sus pasos. Equivalen a los hábitos que antes estaban en el código de Angular.

```json
{
  "_id": "ObjectId",
  "nombreRutina": "Lavar las manos",
  "imagenPortada": "/assets/images/lavar-manos-cover.png",
  "color": "#f0f0f0",
  "momento": "manana",
  "tipoDia": "ambos",
  "pasos": [
    { "orden": 1, "texto": "Abrir el grifo", "imagen": "/assets/images/abrir-grifo.png" }
  ]
}
```

### `usuario_rutinas`
Relaciona qué rutinas tiene asignadas cada usuario y si las ha completado hoy.

```json
{
  "_id": "ObjectId",
  "usuarioId": "ObjectId del usuario",
  "rutinaId": "ObjectId de la rutina",
  "completada": false,
  "fechaAsignacion": "2025-04-30T...",
  "fechaUltimaCompletada": null
}
```

---

## Endpoints de la API

### Login

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| `POST` | `/api/login` | `{ "nombre": "Jordyn" }` | datos del usuario o 404 |

Ejemplo de respuesta correcta:
```json
{
  "data": { "_id": "664f...", "nombre": "Jordyn" },
  "message": "login correcto"
}
```

### Rutinas del usuario

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/usuarios/:id/rutinas` | Devuelve todas las rutinas asignadas al usuario con su estado `completada` y los datos completos de cada rutina |
| `PATCH` | `/api/usuarios/:id/rutinas/:rutinaId/completar` | Marca una rutina como completada |
| `POST` | `/api/usuarios/:id/rutinas/reiniciar` | Pone `completada: false` en todas las rutinas del usuario |

### Rutinas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/rutinas` | Lista todas las rutinas disponibles |
| `GET` | `/api/rutinas/:id` | Devuelve una rutina con todos sus pasos |

---

## Cómo probar los endpoints

Se puede usar **Thunder Client** (extensión de VS Code) o Postman.

### Probar el login
```
POST http://localhost:3000/api/login
Content-Type: application/json

{ "nombre": "Jordyn" }
```

### Obtener rutinas de un usuario
Copiar el `_id` que devuelve el login y usarlo en:
```
GET http://localhost:3000/api/usuarios/664f.../rutinas
```

### Completar una rutina
```
PATCH http://localhost:3000/api/usuarios/664f.../rutinas/665a.../completar
```

### Reiniciar todas las rutinas
```
POST http://localhost:3000/api/usuarios/664f.../rutinas/reiniciar
```

---

## Datos iniciales (seed)

El script `seed.js` crea:

- **2 usuarios**: Jordyn y Carlos
- **9 rutinas**: las mismas que antes estaban en `HabitosService` de Angular
- **Asignaciones**: Jordyn tiene las 9 rutinas, Carlos tiene las 4 primeras

| Usuario | Rutinas asignadas |
|---|---|
| Jordyn | Las 9 rutinas |
| Carlos | Lavar manos, Hacer cama, Poner lavadora, Recoger platos |
