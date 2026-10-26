//

function validarCorreo() {
 //tarea
}

function validarBoleta(boleta) {
    if (typeof boleta !== 'string') return false;
    
}

function validarContrasena(contrasena) {
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {
    validarCorreo, validarBoleta, validarContrasena
}

