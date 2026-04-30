// Script para poblar MongoDB Atlas con los datos iniciales de FUVI
// Ejecutar una sola vez: node seed.js

require('dotenv').config()
const { MongoClient } = require('mongodb')

const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME || 'fuvi'
const MONGO_URI_ATLAS = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@jpozogospw2026.zixkoko.mongodb.net/${DB_NAME}`

// --- DATOS INICIALES ---

const usuarios = [
    { nombre: 'Jordyn', avatar: 'female' },
    { nombre: 'Carlos', avatar: 'male' }
]

const rutinas = [
    {
        nombreRutina: 'Lavar las manos',
        imagenPortada: '/assets/images/lavar-manos-cover.png',
        color: '#f0f0f0',
        momento: 'manana',
        tipoDia: 'ambos',
        pasos: [
            { orden: 1, texto: 'Abrir el grifo', imagen: '/assets/images/abrir-grifo.png' },
            { orden: 2, texto: 'Mojar las manos', imagen: '/assets/images/lavar-manos-cover.png' },
            { orden: 3, texto: 'Frotar con jabon', imagen: '/assets/images/echar-jabon.png' },
            { orden: 4, texto: 'Cerrar el grifo', imagen: '/assets/images/cerrar-grifo.png' },
            { orden: 5, texto: 'Secar las manos', imagen: '/assets/images/secar-manos.png' }
        ]
    },
    {
        nombreRutina: 'Hacer la cama',
        imagenPortada: '/assets/images/hacer-cama-cover.png',
        color: '#ffb3b3',
        momento: 'manana',
        tipoDia: 'semana',
        pasos: [
            { orden: 1, texto: 'Estirar la sabana', imagen: '/assets/images/estirar-sabana.png' },
            { orden: 2, texto: 'Colocar la almohada', imagen: '/assets/images/colocar-almohada.png' },
            { orden: 3, texto: 'Dejar la cama ordenada', imagen: '/assets/images/cama-ordenada.png' }
        ]
    },
    {
        nombreRutina: 'Poner lavadora',
        imagenPortada: '/assets/images/poner-ropa-lavadora.png',
        color: '#ffc0cb',
        momento: 'mediodia',
        tipoDia: 'finde',
        pasos: [
            { orden: 1, texto: 'Llevar la ropa sucia', imagen: '/assets/images/llevar-ropa-sucia.png' },
            { orden: 2, texto: 'Meter la ropa en la lavadora', imagen: '/assets/images/poner-ropa-lavadora.png' },
            { orden: 3, texto: 'Poner detergente', imagen: '/assets/images/poner-detergente.png' },
            { orden: 4, texto: 'Seleccionar programa', imagen: '/assets/images/seleccion-programa.png' }
        ]
    },
    {
        nombreRutina: 'Recoger platos',
        imagenPortada: '/assets/images/recoger-platos.png',
        color: '#b3e5fc',
        momento: 'noche',
        tipoDia: 'ambos',
        pasos: [
            { orden: 1, texto: 'Recoger los platos de la mesa', imagen: '/assets/images/recoger-mesa.png' },
            { orden: 2, texto: 'Llevarlos al fregadero', imagen: '/assets/images/llevar-fregadero.png' },
            { orden: 3, texto: 'Enjuagar los platos', imagen: '/assets/images/enjuagar-platos-user.png' },
            { orden: 4, texto: 'Colocar en el lavavajillas', imagen: '/assets/images/poner-lavavajillas-user.png' }
        ]
    },
    {
        nombreRutina: 'Ordenar la habitacion',
        imagenPortada: '/assets/images/habitacion.png',
        color: '#ffe7b3',
        momento: 'manana',
        tipoDia: 'ambos',
        pasos: [
            { orden: 1, texto: 'Recojo la ropa', imagen: '/assets/images/guardar-ropa.png' },
            { orden: 2, texto: 'Hago la cama', imagen: '/assets/images/estirar-sabana.png' },
            { orden: 3, texto: 'Guardo los juguetes', imagen: '/assets/images/recoger-juguetes.png' },
            { orden: 4, texto: 'Recojo el escritorio', imagen: '/assets/images/escritorio.png' },
            { orden: 5, texto: 'Tiro los papeles', imagen: '/assets/images/tirar-papelera.png' }
        ]
    },
    {
        nombreRutina: 'Preparar la mesa',
        imagenPortada: '/assets/images/poner-mesa.png',
        color: '#ffd8be',
        momento: 'mediodia',
        tipoDia: 'semana',
        pasos: [
            { orden: 1, texto: 'Llevar platos a la mesa', imagen: '/assets/images/comer.png' },
            { orden: 2, texto: 'Colocar vasos y cubiertos', imagen: '/assets/images/poner-mesa.png' },
            { orden: 3, texto: 'Comprobar que esta todo listo', imagen: '/assets/images/comer.png' }
        ]
    },
    {
        nombreRutina: 'Enjuagar platos',
        imagenPortada: '/assets/images/enjuagar-platos.png',
        color: '#cdeffd',
        momento: 'mediodia',
        tipoDia: 'ambos',
        pasos: [
            { orden: 1, texto: 'Llevar platos al fregadero', imagen: '/assets/images/llevar-fregadero.png' },
            { orden: 2, texto: 'Abrir agua y enjuagar', imagen: '/assets/images/enjuagar-platos.png' },
            { orden: 3, texto: 'Dejar platos limpios', imagen: '/assets/images/enjuagar-platos-user.png' }
        ]
    },
    {
        nombreRutina: 'Higiene antes de dormir',
        imagenPortada: '/assets/images/pasta-dientes.png',
        color: '#e2d8ff',
        momento: 'noche',
        tipoDia: 'ambos',
        pasos: [
            { orden: 1, texto: 'Cepillarse los dientes', imagen: '/assets/images/pasta-dientes.png' },
            { orden: 2, texto: 'Lavar manos y cara', imagen: '/assets/images/lavar-cara.png' },
            { orden: 3, texto: 'Secar con toalla', imagen: '/assets/images/secar-cara.png' },
            { orden: 4, texto: 'Prepararse para dormir', imagen: '/assets/images/Dormir.png' }
        ]
    },
    {
        nombreRutina: 'Colada del fin de semana',
        imagenPortada: '/assets/images/poner-ropa-lavadora.png',
        color: '#ffd6e7',
        momento: 'mediodia',
        tipoDia: 'finde',
        pasos: [
            { orden: 1, texto: 'Separar la ropa sucia', imagen: '/assets/images/llevar-ropa-sucia.png' },
            { orden: 2, texto: 'Poner ropa en la lavadora', imagen: '/assets/images/poner-ropa-lavadora.png' },
            { orden: 3, texto: 'Anadir detergente', imagen: '/assets/images/poner-detergente.png' },
            { orden: 4, texto: 'Elegir programa de lavado', imagen: '/assets/images/seleccion-programa.png' }
        ]
    }
]

// --- FUNCIÓN PRINCIPAL ---

async function seed() {
    let client

    try {
        client = await MongoClient.connect(MONGO_URI_ATLAS)
        console.log('conectado a BBDD')
        const db = client.db(DB_NAME)

        // Limpiar colecciones existentes
        await db.collection('usuarios').deleteMany({})
        await db.collection('rutinas').deleteMany({})
        await db.collection('usuario_rutinas').deleteMany({})
        console.log('colecciones vaciadas')

        // Insertar usuarios
        const usuariosInsertados = await db.collection('usuarios').insertMany(usuarios)
        console.log(`${usuariosInsertados.insertedCount} usuarios insertados`)

        const idJordyn = usuariosInsertados.insertedIds[0]
        const idCarlos = usuariosInsertados.insertedIds[1]

        // Insertar rutinas
        const rutinasInsertadas = await db.collection('rutinas').insertMany(rutinas)
        console.log(`${rutinasInsertadas.insertedCount} rutinas insertadas`)

        const idsRutinas = Object.values(rutinasInsertadas.insertedIds)

        // Asignar rutinas a usuarios
        // Jordyn tiene todas las rutinas
        const relacionesJordyn = idsRutinas.map(rutinaId => ({
            usuarioId: idJordyn,
            rutinaId: rutinaId,
            completada: false,
            fechaAsignacion: new Date(),
            fechaUltimaCompletada: null
        }))

        // Carlos tiene las 4 primeras rutinas
        const relacionesCarlos = idsRutinas.slice(0, 4).map(rutinaId => ({
            usuarioId: idCarlos,
            rutinaId: rutinaId,
            completada: false,
            fechaAsignacion: new Date(),
            fechaUltimaCompletada: null
        }))

        const todasLasRelaciones = [...relacionesJordyn, ...relacionesCarlos]
        const relacionesInsertadas = await db.collection('usuario_rutinas').insertMany(todasLasRelaciones)
        console.log(`${relacionesInsertadas.insertedCount} relaciones usuario-rutina insertadas`)

        console.log('seed completado con éxito')

    } catch(e) {
        console.log(`error en seed: ${e}`)
    } finally {
        if (client) await client.close()
    }
}

seed()
