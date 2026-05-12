const { MongoClient } = require('mongodb');
const { config } = require('./config/index');

const MONGO_URI = `mongodb+srv://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}/${config.DB_NAME}`;

const usuarios = [
    { nombre: 'Jordyn', avatar: 'female', color: '#FFDDE1' },
    { nombre: 'Carlos', avatar: 'male',   color: '#D1E8FF' },
    { nombre: 'María',  avatar: 'female', color: '#FFE8D1' },
    { nombre: 'Lucas',  avatar: 'male',   color: '#D1FFE8' },
    { nombre: 'Ana',    avatar: 'female', color: '#FFF5D1' },
    { nombre: 'Pablo',  avatar: 'male',   color: '#E8D1FF' },
];

const rutinas = [
    {
        nombreRutina: 'Hacer la cama',
        imagenPortada: '/assets/images/hacer-cama-cover.png',
        color: '#FFD6E0',
        momento: 'manana',
        tipoDia: 'ambos',
        pasos: [
            { texto: 'Estirar la sábana', imagen: '/assets/images/estirar-sabana.png' },
            { texto: 'Colocar la almohada', imagen: '/assets/images/colocar-almohada.png' },
            { texto: 'Guardar la ropa', imagen: '/assets/images/guardar-ropa.png' },
            { texto: 'Cama ordenada', imagen: '/assets/images/cama-ordenada.png' },
        ]
    },
    {
        nombreRutina: 'Lavarse las manos',
        imagenPortada: '/assets/images/lavar-manos-cover.png',
        color: '#D6E8FF',
        momento: 'mediodia',
        tipoDia: 'ambos',
        pasos: [
            { texto: 'Abrir el grifo', imagen: '/assets/images/abrir-grifo.png' },
            { texto: 'Echar jabón', imagen: '/assets/images/echar-jabon.png' },
            { texto: 'Secar las manos', imagen: '/assets/images/secar-manos.png' },
            { texto: 'Cerrar el grifo', imagen: '/assets/images/cerrar-grifo.png' },
        ]
    },
    {
        nombreRutina: 'Lavar la cara',
        imagenPortada: '/assets/images/lavar-cara.png',
        color: '#E8D6FF',
        momento: 'noche',
        tipoDia: 'ambos',
        pasos: [
            { texto: 'Abrir el grifo', imagen: '/assets/images/abrir-grifo.png' },
            { texto: 'Lavar la cara', imagen: '/assets/images/lavar-cara.png' },
            { texto: 'Secar la cara', imagen: '/assets/images/secar-cara.png' },
            { texto: 'Cerrar el grifo', imagen: '/assets/images/cerrar-grifo.png' },
        ]
    },
    {
        nombreRutina: 'Poner la mesa',
        imagenPortada: '/assets/images/poner-mesa.png',
        color: '#FFE8D6',
        momento: 'mediodia',
        tipoDia: 'semana',
        pasos: [
            { texto: 'Poner la mesa', imagen: '/assets/images/poner-mesa.png' },
            { texto: 'Servir la comida', imagen: '/assets/images/comida-mesa.png' },
            { texto: 'Recoger los platos', imagen: '/assets/images/recoger-platos.png' },
            { texto: 'Llevar al fregadero', imagen: '/assets/images/llevar-fregadero.png' },
        ]
    },
    {
        nombreRutina: 'Lavar los platos',
        imagenPortada: '/assets/images/enjuagar-platos-user.png',
        color: '#D6FFE8',
        momento: 'mediodia',
        tipoDia: 'semana',
        pasos: [
            { texto: 'Recoger los platos', imagen: '/assets/images/recoger-platos.png' },
            { texto: 'Enjuagar los platos', imagen: '/assets/images/enjuagar-platos.png' },
            { texto: 'Poner el lavavajillas', imagen: '/assets/images/poner-lavavajillas-user.png' },
            { texto: 'Poner el detergente', imagen: '/assets/images/poner-detergente.png' },
            { texto: 'Seleccionar programa', imagen: '/assets/images/seleccion-programa.png' },
        ]
    },
    {
        nombreRutina: 'Poner la lavadora',
        imagenPortada: '/assets/images/poner-ropa-lavadora.png',
        color: '#FFF5D6',
        momento: 'manana',
        tipoDia: 'finde',
        pasos: [
            { texto: 'Llevar la ropa sucia', imagen: '/assets/images/llevar-ropa-sucia.png' },
            { texto: 'Meter la ropa', imagen: '/assets/images/poner-ropa-lavadora.png' },
            { texto: 'Poner el detergente', imagen: '/assets/images/poner-detergente.png' },
            { texto: 'Seleccionar programa', imagen: '/assets/images/seleccion-programa.png' },
        ]
    },
    {
        nombreRutina: 'Recoger los juguetes',
        imagenPortada: '/assets/images/recoger-juguetes.png',
        color: '#FFD6D6',
        momento: 'noche',
        tipoDia: 'ambos',
        pasos: [
            { texto: 'Recoger los juguetes', imagen: '/assets/images/recoger-juguetes.png' },
            { texto: 'Tirar a la papelera', imagen: '/assets/images/tirar-papelera.png' },
            { texto: 'Habitación ordenada', imagen: '/assets/images/habitacion.png' },
        ]
    },
    {
        nombreRutina: 'Cepillarse los dientes',
        imagenPortada: '/assets/images/pasta-dientes.png',
        color: '#D6F5FF',
        momento: 'noche',
        tipoDia: 'ambos',
        pasos: [
            { texto: 'Coger el cepillo', imagen: '/assets/images/pasta-dientes.png' },
            { texto: 'Abrir el grifo', imagen: '/assets/images/abrir-grifo.png' },
            { texto: 'Cepillarse los dientes', imagen: '/assets/images/pasta-dientes.png' },
            { texto: 'Cerrar el grifo', imagen: '/assets/images/cerrar-grifo.png' },
        ]
    },
    {
        nombreRutina: 'Recoger la mesa',
        imagenPortada: '/assets/images/recoger-mesa.png',
        color: '#E8FFD6',
        momento: 'noche',
        tipoDia: 'ambos',
        pasos: [
            { texto: 'Recoger la mesa', imagen: '/assets/images/recoger-mesa.png' },
            { texto: 'Recoger los platos', imagen: '/assets/images/recoger-platos.png' },
            { texto: 'Llevar al fregadero', imagen: '/assets/images/llevar-fregadero.png' },
        ]
    },
    {
        nombreRutina: 'Preparar el desayuno',
        imagenPortada: '/assets/images/comida-mesa.png',
        color: '#FFE8F5',
        momento: 'manana',
        tipoDia: 'ambos',
        pasos: [
            { texto: 'Preparar la mesa', imagen: '/assets/images/poner-mesa.png' },
            { texto: 'Servir el desayuno', imagen: '/assets/images/comida-mesa.png' },
            { texto: 'Desayunar', imagen: '/assets/images/comer.png' },
        ]
    },
    {
        nombreRutina: 'Regar las plantas',
        imagenPortada: '/assets/images/habitacion.png',
        color: '#D6FFD6',
        momento: 'manana',
        tipoDia: 'semana',
        pasos: [
            { texto: 'Buscar el regador', imagen: '/assets/images/habitacion.png' },
            { texto: 'Regar las plantas', imagen: '/assets/images/habitacion.png' },
        ]
    },
    {
        nombreRutina: 'Estiramientos',
        imagenPortada: '/assets/images/Dormir.png',
        color: '#D6E8FF',
        momento: 'manana',
        tipoDia: 'ambos',
        pasos: [
            { texto: 'Levantarse despacio', imagen: '/assets/images/Dormir.png' },
            { texto: 'Estirar los brazos', imagen: '/assets/images/Dormir.png' },
            { texto: 'Estirar las piernas', imagen: '/assets/images/Dormir.png' },
        ]
    },
    {
        nombreRutina: 'Revisar la mochila',
        imagenPortada: '/assets/images/escritorio.png',
        color: '#FFD6E8',
        momento: 'noche',
        tipoDia: 'semana',
        pasos: [
            { texto: 'Abrir la mochila', imagen: '/assets/images/escritorio.png' },
            { texto: 'Meter los libros', imagen: '/assets/images/escritorio.png' },
            { texto: 'Cerrar la mochila', imagen: '/assets/images/escritorio.png' },
        ]
    },
    {
        nombreRutina: 'Poner mesa desayuno',
        imagenPortada: '/assets/images/poner-mesa.png',
        color: '#FFF5D6',
        momento: 'manana',
        tipoDia: 'ambos',
        pasos: [
            { texto: 'Poner la mesa', imagen: '/assets/images/poner-mesa.png' },
            { texto: 'Servir el desayuno', imagen: '/assets/images/comida-mesa.png' },
        ]
    },
];

const asignaciones = [
    { usuarioIdx: 0, rutinaIdxs: [0,1,2,3,4,5,6,7,8] },
    { usuarioIdx: 1, rutinaIdxs: [0,1,2,3] },
    { usuarioIdx: 2, rutinaIdxs: [0,1,3,5,7,9,10] },
    { usuarioIdx: 3, rutinaIdxs: [2,4,6,8,11,12] },
    { usuarioIdx: 4, rutinaIdxs: [0,3,4,5,7,9,13] },
    { usuarioIdx: 5, rutinaIdxs: [1,6,8,10,11] },
];

async function seed() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('Conectado a MongoDB');

        const db = client.db(config.DB_NAME);

        await db.collection('sesiones').deleteMany({});
        await db.collection('valoraciones').deleteMany({});
        await db.collection('usuario_rutinas').deleteMany({});
        await db.collection('usuarios').deleteMany({});
        await db.collection('rutinas').deleteMany({});
        console.log('Colecciones limpiadas');

        const usuariosResult = await db.collection('usuarios').insertMany(usuarios);
        const usuarioIds = Object.values(usuariosResult.insertedIds);
        console.log(`${usuarioIds.length} usuarios insertados`);

        const rutinasResult = await db.collection('rutinas').insertMany(rutinas);
        const rutinaIds = Object.values(rutinasResult.insertedIds);
        console.log(`${rutinaIds.length} rutinas insertadas`);

        const usuarioRutinas = [];
        for (const asignacion of asignaciones) {
            const usuarioId = usuarioIds[asignacion.usuarioIdx];
            for (const rutinaIdx of asignacion.rutinaIdxs) {
                usuarioRutinas.push({
                    usuarioId,
                    rutinaId: rutinaIds[rutinaIdx],
                    completada: false,
                    fechaUltimaCompletada: null
                });
            }
        }

        await db.collection('usuario_rutinas').insertMany(usuarioRutinas);
        console.log(`${usuarioRutinas.length} asignaciones insertadas`);

        console.log('Seed completado con éxito');
    } catch (err) {
        console.error('Error en el seed:', err);
    } finally {
        await client.close();
    }
}

seed();
