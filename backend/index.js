const express = require('express');
const app = express();
const cors = require('cors');

const { config } = require('./config/index');
const usuariosAPI = require('./rutas/usuarios');
const rutinasAPI = require('./rutas/rutinas');

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

usuariosAPI(app);
rutinasAPI(app);

app.listen(config.port, () => {
    console.log(`servidor escuchando en ${config.port}`);
})
