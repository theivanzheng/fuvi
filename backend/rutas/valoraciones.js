const ValoracionesService = require('../servicios/valoracionesService');

function valoracionesAPI(app) {
    const valoracionesService = new ValoracionesService();

    app.post('/api/valoraciones', async function (req, res, next) {
        const { usuarioId, rutinaId, estrellas } = req.body;
        try {
            const id = await valoracionesService.insertarValoracion({ usuarioId, rutinaId, estrellas });
            res.status(201).json({
                data: { id },
                message: 'valoración guardada con éxito'
            });
        } catch (err) {
            next(err);
        }
    });
}

module.exports = valoracionesAPI;
