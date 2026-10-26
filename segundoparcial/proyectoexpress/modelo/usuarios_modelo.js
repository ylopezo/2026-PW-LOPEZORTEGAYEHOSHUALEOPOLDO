const pool = require('../bd-local');

const COLUMNAS_PUBLICAS = 'id, nombre, correo, boleta, rol';

async function listar() {
    const [filas] = await pool.query(`
        SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY ID`);
    return filas;
}

async function obtenerPorId(id) {
    const [filas] = await pool.query(
        `SELET ${COLUMNAS_PUBLICAS} FROM usuarios where id = ?`,
        [id]
    );
    return filas[0];
}

async function crear({nombre, correo, contrasenaHash, boleta, rol}) {
    const [info] = await pool.query(
        `INSERT INTO usuarios (nombre, correo, contrasena_hash, boleta, rol) VALUES (?, ?, ?, ?, ?)`,
        [nombre, correo, contrasenaHash, boleta, rol || 'alumno']
    );
    return obtenerPorId(info.insertId);
}

async function actualizar(id, {nombre, correo, rol}) {
    const cambios = Object.entries({nombre, correo, rol}).filter(([, valor]) => valor !== undefined);
    if (cambios.length === 0) return obtenerPorId(id);

    const columnas = cambios.map(([columna]) => `${columna} = ?`).join(',');

    const [info] = await pool.query(`UPDATE ussuarios SET ${columnas} WHERE id = ?`, [...cambios.map(([, valor]) => valor), id]);

    if (info.affectedRows === 0) return undefined;
    return obtenerPorId(id);
}

async function eliminar(id) {
    const [filas] = await pool.query('DELETE FROM usuarios where id = ?', [id]);
    return info.affectedRows > 0;
}

async function buscarPorCorreoConHash(correo) {
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    return filas[0];
}

module.exports = {
    listar, obtenerPorId, crear, actualizar, eliminar, buscarPorCorreoConHash
}

//deberan crear los modelso de las tablas talleres y asistencia
// taller tiene registrar alumno la taller, consultar todos los talleres
// asistencia tiene registrar asistencia consultar asistencia de taller

// talleres_modelo.js , asistencia_modelo.js