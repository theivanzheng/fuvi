const express = require('express');

const UsuariosService = require('../servicios/usuariosService');

const COOKIE_NAME = 'fuvi_session';

function getCookies(cookieHeader = '') {
    return cookieHeader
        .split(';')
        .map(cookie => cookie.trim())
        .filter(Boolean)
        .reduce((cookies, cookie) => {
            const [name, ...valueParts] = cookie.split('=');
            cookies[name] = decodeURIComponent(valueParts.join('='));
            return cookies;
        }, {});
}

function crearCookieSesion(token) {
    return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

function borrarCookieSesion() {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function usuariosAPI(app) {
    const router = express.Router();
    app.use('/api/usuarios', router);

    const usuariosService = new UsuariosService();

    app.post('/api/login', async function (req, res, next) {
        const { body: { nombre } } = req;
        try {
            const login = await usuariosService.login({ nombre });

            if (!login) {
                return res.status(404).json({
                    data: null,
                    message: 'usuario no encontrado'
                });
            }

            res.setHeader('Set-Cookie', crearCookieSesion(login.token));
            res.status(200).json({
                data: login.usuario,
                message: 'login correcto'
            });
        } catch (err) {
            next(err);
        }
    });

    app.get('/api/sesion', async function (req, res, next) {
        const cookies = getCookies(req.headers.cookie);
        const token = cookies[COOKIE_NAME];

        if (!token) {
            return res.status(401).json({
                data: null,
                message: 'sesión no iniciada'
            });
        }

        try {
            const usuario = await usuariosService.getUsuarioPorSesion({ token });

            if (!usuario) {
                res.setHeader('Set-Cookie', borrarCookieSesion());
                return res.status(401).json({
                    data: null,
                    message: 'sesión no válida'
                });
            }

            res.status(200).json({
                data: usuario,
                message: 'sesión recuperada con éxito'
            });
        } catch (err) {
            next(err);
        }
    });

    app.post('/api/logout', async function (req, res, next) {
        const cookies = getCookies(req.headers.cookie);
        const token = cookies[COOKIE_NAME];

        try {
            if (token) {
                await usuariosService.logout({ token });
            }

            res.setHeader('Set-Cookie', borrarCookieSesion());
            res.status(200).json({
                data: true,
                message: 'logout correcto'
            });
        } catch (err) {
            next(err);
        }
    });

    router.get('/:id/rutinas', async function (req, res, next) {
        const { id } = req.params;
        try {
            const rutinas = await usuariosService.getRutinasPorUsuario({ usuarioId: id });
            res.status(200).json({
                data: rutinas,
                message: 'rutinas del usuario recuperadas con éxito'
            });
        } catch (err) {
            next(err);
        }
    });

    router.patch('/:id/rutinas/:rutinaId/completar', async function (req, res, next) {
        const { id, rutinaId } = req.params;
        try {
            const rutinaCompletada = await usuariosService.completarRutina({ usuarioId: id, rutinaId });
            res.status(200).json({
                data: rutinaCompletada,
                message: 'rutina marcada como completada'
            });
        } catch (err) {
            next(err);
        }
    });

    router.post('/:id/rutinas/reiniciar', async function (req, res, next) {
        const { id } = req.params;
        try {
            const rutinasReiniciadas = await usuariosService.reiniciarRutinas({ usuarioId: id });
            res.status(200).json({
                data: rutinasReiniciadas,
                message: 'rutinas reiniciadas con éxito'
            });
        } catch (err) {
            next(err);
        }
    });

    router.patch('/:id/avatar', async function (req, res, next) {
        const { id } = req.params;
        const { avatar } = req.body;
        try {
            const avatarActualizado = await usuariosService.actualizarAvatar({ usuarioId: id, avatar });
            res.status(200).json({
                data: avatarActualizado,
                message: 'avatar actualizado con éxito'
            });
        } catch (err) {
            next(err);
        }
    });
}

module.exports = usuariosAPI;
