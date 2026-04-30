const crypto = require('node:crypto');
const MongoLib = require('../lib/mongo');

class UsuariosService {
    constructor() {
        this.collection = 'usuarios';
        this.mongoDB = new MongoLib();
    }

    async login({ nombre }) {
        const nombreEscapado = nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const usuario = await this.mongoDB.getOne(this.collection, {
            nombre: {
                $regex: `^${nombreEscapado}$`,
                $options: 'i'
            }
        });
        if (!usuario) {
            return null;
        }

        const token = crypto.randomUUID();
        await this.mongoDB.crearSesion(usuario._id.toString(), token);

        return {
            usuario,
            token
        };
    }

    async getUsuarioPorSesion({ token }) {
        const usuario = await this.mongoDB.getUsuarioPorSesion(token);
        return usuario || null;
    }

    async logout({ token }) {
        const sesionBorrada = await this.mongoDB.borrarSesion(token);
        return sesionBorrada || 0;
    }

    async getRutinasPorUsuario({ usuarioId }) {
        const rutinas = await this.mongoDB.getRutinasPorUsuario(usuarioId);
        return rutinas || [];
    }

    async completarRutina({ usuarioId, rutinaId }) {
        const rutinaCompletada = await this.mongoDB.completarRutina(usuarioId, rutinaId);
        return rutinaCompletada || 0;
    }

    async reiniciarRutinas({ usuarioId }) {
        const rutinasReiniciadas = await this.mongoDB.reiniciarRutinas(usuarioId);
        return rutinasReiniciadas || 0;
    }

    async actualizarAvatar({ usuarioId, avatar }) {
        const avatarActualizado = await this.mongoDB.actualizarAvatar(usuarioId, avatar);
        return avatarActualizado || 0;
    }
}

module.exports = UsuariosService;
