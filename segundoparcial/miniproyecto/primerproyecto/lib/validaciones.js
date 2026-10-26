//

function validarCorreo() {
 //tarea
}

function validarBoleta(boleta) {
    const regex = /^\d{10}$/;
    return regex.test(boleta);
    
}

function validarContrasena(contrasena) {
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {
    validarCorreo, validarBoleta, validarContrasena
}

