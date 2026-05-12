const { MongoClient, ObjectId } = require('mongodb');
const { config } = require('../config/index');

const USER = config.DB_USER;
const PASSWORD = config.DB_PASSWORD;
const DB_HOST = config.DB_HOST;
const DB_NAME = config.DB_NAME;

const MONGO_URI = `mongodb+srv://${USER}:${PASSWORD}@${DB_HOST}/${DB_NAME}`;

class MongoLib {
    constructor() {
        this.client = new MongoClient(MONGO_URI);
        this.dbName = DB_NAME;
    }

    connect() {
        if (!MongoLib.connection){
            MongoLib.connection = this.client.connect()
                .then(() => {
                    console.log('Conectado a la BBDD');
                    return this.client.db(this.dbName);
                })
        }

        return MongoLib.connection;
    }

    getAll(collection, query) {
        return this.connect().then(db => {
            return db.collection(collection).find(query).toArray();
        })
    }

    getById(collection, id) {
        return this.connect().then(db => {
            return db.collection(collection).findOne({ _id: new ObjectId(id) });
        })
    }

    getOne(collection, query) {
        return this.connect().then(db => {
            return db.collection(collection).findOne(query);
        })
    }

    crearSesion(usuarioId, token) {
        return this.connect().then(db => {
            return db.collection('sesiones').insertOne({
                usuarioId: new ObjectId(usuarioId),
                token,
                fechaCreacion: new Date()
            })
        }).then(() => token);
    }

    getUsuarioPorSesion(token) {
        return this.connect().then(db => {
            return db.collection('sesiones').aggregate([
                {
                    $match: {
                        token
                    }
                },
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: 'usuarioId',
                        foreignField: '_id',
                        as: 'usuario'
                    }
                },
                {
                    $unwind: '$usuario'
                },
                {
                    $replaceRoot: {
                        newRoot: '$usuario'
                    }
                }
            ]).toArray();
        }).then(result => result[0] || null);
    }

    borrarSesion(token) {
        return this.connect().then(db => {
            return db.collection('sesiones').deleteOne({ token });
        }).then(result => result.deletedCount || 0);
    }

    getRutinasPorUsuario(usuarioId) {
        return this.connect().then(db => {
            return db.collection('usuario_rutinas').aggregate([
                {
                    $match: {
                        usuarioId: new ObjectId(usuarioId)
                    }
                },
                {
                    $lookup: {
                        from: 'rutinas',
                        localField: 'rutinaId',
                        foreignField: '_id',
                        as: 'rutina'
                    }
                },
                {
                    $unwind: '$rutina'
                }
            ]).toArray();
        })
    }

    completarRutina(usuarioId, rutinaId) {
        return this.connect().then(db => {
            return db.collection('usuario_rutinas').updateOne(
                {
                    usuarioId: new ObjectId(usuarioId),
                    rutinaId: new ObjectId(rutinaId)
                },
                {
                    $set: {
                        completada: true,
                        fechaUltimaCompletada: new Date()
                    }
                }
            )
        }).then(result => result.modifiedCount || 0);
    }

    reiniciarRutinas(usuarioId) {
        return this.connect().then(db => {
            return db.collection('usuario_rutinas').updateMany(
                {
                    usuarioId: new ObjectId(usuarioId)
                },
                {
                    $set: {
                        completada: false,
                        fechaUltimaCompletada: null
                    }
                }
            )
        }).then(result => result.modifiedCount || 0);
    }

    actualizarAvatar(usuarioId, avatar) {
        return this.connect().then(db => {
            return db.collection('usuarios').updateOne(
                { _id: new ObjectId(usuarioId) },
                { $set: { avatar } }
            )
        }).then(result => result.modifiedCount || 0);
    }

    insertarValoracion(usuarioId, rutinaId, estrellas) {
        return this.connect().then(db => {
            return db.collection('valoraciones').insertOne({
                usuarioId: new ObjectId(usuarioId),
                rutinaId: new ObjectId(rutinaId),
                estrellas,
                fecha: new Date()
            });
        }).then(result => result.insertedId);
    }
}

module.exports = MongoLib;
