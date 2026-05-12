const MongoLib = require('../lib/mongo');

class ValoracionesService {
    constructor() {
        this.mongoDB = new MongoLib();
    }

    async insertarValoracion({ usuarioId, rutinaId, estrellas }) {
        const id = await this.mongoDB.insertarValoracion(usuarioId, rutinaId, estrellas);
        return id;
    }
}

module.exports = ValoracionesService;
