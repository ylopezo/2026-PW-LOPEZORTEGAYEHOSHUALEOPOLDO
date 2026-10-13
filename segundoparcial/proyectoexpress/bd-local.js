const mysql = require('mysql2/promise');

/*
* La base de datos Local la usaremos para verificar pruebas internas, se buscara que deben de crear cada uno una cuenta en supabase.com y generaremos una API para conectarnos a un servicio de bd en la nube, para ello debemos configurar el archivo .env
*/

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'n0m310',
    datase: 'cecyt9_local',
    dataStrings: true
})