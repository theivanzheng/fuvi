const express = require('express');

const RutinasService = require('../servicios/rutinasService');

function rutinasAPI(app) {
    const router = express.Router();
    app.use('/api/rutinas', router);

    const rutinasService = new RutinasService();

    router.get('/', async function (req, res, next) {
        try {
            const rutinas = await rutinasService.getRutinas();
            res.status(200).json({
                data: rutinas,
                message: 'rutinas recuperadas con éxito'
            });
        } catch (err) {
            next(err);
        }
    });

    router.get('/:id', async function (req, res, next) {
        const { id: rutinaId } = req.params;
        try {
            const rutina = await rutinasService.getRutina({ rutinaId });

            if (!rutina) {
                return res.status(404).json({
                    data: null,
                    message: 'rutina no encontrada'
                });
            }

            res.status(200).json({
                data: rutina,
                message: 'rutina recuperada con éxito'
            });
        } catch (err) {
            next(err);
        }
    });
}

module.exports = rutinasAPI;
