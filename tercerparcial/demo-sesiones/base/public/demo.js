/*
* Funcion usada para hacer llamadas a la API usando el metodo, url y cuerpo si lo tiene
*/
async function callApi(method, url, body) {
    try {
        const uppercaseMethod = method.toUpperCase();

        const options = {
            method: uppercaseMethod,
            headers: {}
        };

        if (body && uppercaseMethod !== 'GET' && uppercaseMethod !== 'HEAD') {
            options.headers['Content-Type'] = 'application/json';
            options.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const response = await fetch(url, options);

        const contentType = response.headers.get("Content-Type");
        const isJson = contentType && contentType.includes("application/json");

        const data = isJson ? await response.json() : null;

        appendToLog(method, url, response.status, data);

        return {
            status: response.status,
            data
        };
    } catch (e) {
        console.log(e);
        return { status: 0, data: null, error: e.message };
    }
}

/*
* La funcion appendToLog se usa para anotar a la bitacora una linea usando el metodo, url, codigo status y los datos regresados
* se usa textContent porque innerHTML interpreta sus contenidos como HTML estandar lo que puede injectar codigo
*/
function appendToLog(method, url, code, data) {
    const log = document.getElementById('bitacora');
    if (!log) return;

    const li = document.createElement('li');   

    const spanCode = document.createElement('span');
    spanCode.textContent = code;

    if (code >= 200 && code < 300) {
        spanCode.className = 'codigo ok';
    } else if (code == 401) {
        spanCode.className = 'codigo e401';
    } else if (code == 403) {
        spanCode.className = 'codigo e403';
    } else {
        spanCode.className = 'codigo error';
    }

    const info = document.createElement('strong');
    info.textContent = ` ${method.toUpperCase()} ${url}`;
    
    const jsonBlock = document.createElement('pre');
    jsonBlock.textContent = data ? JSON.stringify(data, null, 2) : '';

    li.append(spanCode, info, jsonBlock);
    log.prepend(li);
}

/*
* La funcion loadConfig sirve para cargar la configuracion al <pre> con id config
*/
async function loadConfig() {
    const { data } = await callApi('GET', '/api/config');
    const config = document.getElementById('config');
    if (config && data) {
        config.textContent = JSON.stringify(data, null, 2);
    }
}

/*
* La funcion updateSessions sirve para obtener las sesiones desde el endpoint /api/diagnostico/sesiones y ponerlas en la table de sesiones
*/
async function updateSessions() {
    const { data } = await callApi('GET', '/api/diagnostico/sesiones');
    
    if (data) {
        const tablaSesiones = document.getElementById('tabla-sesiones');
        const donde = document.getElementById('donde');

        if (donde && data.almacen) {
            donde.textContent = data.almacen;
        }

        if (tablaSesiones) {
            tablaSesiones.innerHTML = '';
            const sesiones = Array.isArray(data.sesiones) ? data.sesiones : [];

            if (sesiones.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 4;
                td.textContent = '(sin sesiones)';
                tr.appendChild(td);
                tablaSesiones.appendChild(tr);
                return;
            }

            sesiones.forEach((s) => {
                const tr = document.createElement('tr');

                const tdId = document.createElement('td');
                const idTexto = s.sesion || s.id || s.sid || '';
                const esMia = s.esLaTuya || s.actual || s.esTuya || (data.miSesion && data.miSesion === idTexto);
                tdId.textContent = esMia ? `${idTexto} (la tuya)` : idTexto;

                const tdUsuario = document.createElement('td');
                tdUsuario.textContent = s.usuario || s.user || 'Anónimo';

                const tdVisitas = document.createElement('td');
                tdVisitas.textContent = s.visitas ?? 0;

                const tdVence = document.createElement('td');
                const rawExpira = s.expira || s.vence || s.expires;
                if (rawExpira) {
                    const fecha = new Date(rawExpira);
                    tdVence.textContent = isNaN(fecha.getTime())
                        ? rawExpira
                        : fecha.toLocaleString();
                } else {
                    tdVence.textContent = '—';
                }

                tr.append(tdId, tdUsuario, tdVisitas, tdVence);
                tablaSesiones.appendChild(tr);
            });
        }
    }
}

const cookieJs = document.getElementById('cookie-js');
const estado = document.getElementById('estado');

/*
* La funcion updateCookie se usa para actualizar los datos de la sesion y intentar obtener la cookie si es que se puede
*/
async function updateCookie() {
    if (!cookieJs || !estado) return;
    const response = await callApi('GET', '/api/sesion')
    const data = response.data;

    if (response.status === 200) {
      estado.className = 'con-sesion';
      estado.textContent = `Usuario: ${data.usuario.nombre} | Rol: ${data.usuario.rol} | Sesión: ${data.sesion} | Expira en: ${data.expiraEnSegundos}s`;
    } else {
      estado.className = 'sin-sesion';
      estado.textContent = `Sin sesión (el servidor responde ${response.status})`;
    }

    cookieJs.textContent = document.cookie || '(vacío)';
}

/*
* La funcion refreshAll se usa para llamar las funciones de actualizacion juntas usada despues del login form y cuando se presionan los botonos
*/
async function refreshAll() {
    updateCookie();
    await updateSessions();
}

const form = document.getElementById('form-login');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        await callApi('POST', '/api/login', {
            usuario: formData.get('usuario'),
            contrasena: formData.get('contrasena')
        });
        
        await refreshAll();
    });
}

const buttons = document.querySelectorAll('button[data-url]');
buttons.forEach((b) => {
    b.addEventListener('click', async () => {
        const url = b.dataset.url;
        const method = b.dataset.metodo;
        await callApi(method, url);
        await refreshAll();
    });
});

const select = document.getElementById('usuario');
if (select) {
    select.addEventListener('change', (event) => {
        const usuarioSeleccionado = event.target.value;
        const contrasena = document.getElementById('contrasena');
        if (contrasena) {
            contrasena.value = `${usuarioSeleccionado}12345`;
        }
    });
}

const refreshButton = document.getElementById('btn-refrescar');
if (refreshButton) {
    refreshButton.addEventListener('click', refreshAll);
}

const btnSesiones = document.getElementById('btn-sesiones');
if (btnSesiones) {
    btnSesiones.addEventListener('click', updateSessions);
}

updateCookie();
loadConfig();
updateSessions();