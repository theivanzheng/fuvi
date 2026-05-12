const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');

const { config } = require('./config/index');
const usuariosAPI = require('./rutas/usuarios');
const rutinasAPI = require('./rutas/rutinas');
const valoracionesAPI = require('./rutas/valoraciones');

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

usuariosAPI(app);
rutinasAPI(app);
valoracionesAPI(app);

const distPath = path.join(__dirname, '../dist/fuvi/browser');
app.use(express.static(distPath));
app.use(function (req, res) {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(config.port, '0.0.0.0', () => {
    console.log(`servidor escuchando en ${config.port}`);
})
