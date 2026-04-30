const MongoLib = require('../lib/mongo');

class RutinasService {
    constructor() {
        this.collection = 'rutinas';
        this.mongoDB = new MongoLib();
    }

    async getRutinas() {
        const rutinas = await this.mongoDB.getAll(this.collection, {});
        return rutinas || [];
    }

    async getRutina({ rutinaId }) {
        const rutina = await this.mongoDB.getById(this.collection, rutinaId);
        return rutina || null;
    }
}

module.exports = RutinasService;
