/* =========================================================================
   almacenamiento.js
   Guarda el avance de los descifradores.

   Funciona en dos capas:
     1. NAVEGADOR  : por defecto. No requiere configuración y sirve para que
                     cualquiera abra la app y la use de inmediato.
     2. HOJA DE CÁLCULO : opcional. Al pegar la URL de un Apps Script, el
                     avance queda en una hoja de Google compartida, de modo
                     que un estudiante encuentre su progreso en cualquier
                     computador de la sala de sistemas.

   PRIVACIDAD: aquí solo se guardan CÓDIGOS de descifrador (D01, D02...) y
   nunca nombres. La equivalencia entre código y estudiante la conserva el
   docente en papel. Esto respeta lo declarado en el blueprint sobre no
   ingresar datos personales de estudiantes en herramientas públicas.
   ========================================================================= */

const CLAVE_LOCAL = 'codigo-tierradentro-avance';
const CLAVE_URL   = 'codigo-tierradentro-hoja';

/* ----- Capa 1: navegador --------------------------------------------- */

/** Lee todo el avance guardado en este navegador. */
function leerLocal() {
  try {
    const crudo = localStorage.getItem(CLAVE_LOCAL);
    return crudo ? JSON.parse(crudo) : {};
  } catch (error) {
    // Si el navegador bloquea el almacenamiento, la app sigue funcionando
    console.warn('No se pudo leer el avance local:', error);
    return {};
  }
}

/** Guarda todo el avance en este navegador. */
function guardarLocal(datos) {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(datos));
    return true;
  } catch (error) {
    console.warn('No se pudo guardar el avance local:', error);
    return false;
  }
}

/* ----- Capa 2: hoja de cálculo --------------------------------------- */

/** Devuelve la URL del Apps Script si el docente ya la configuró. */
function obtenerUrlHoja() {
  return localStorage.getItem(CLAVE_URL) || '';
}

/** Guarda la URL del Apps Script. Se hace una sola vez, desde Ajustes. */
function definirUrlHoja(url) {
  if (url) localStorage.setItem(CLAVE_URL, url.trim());
  else localStorage.removeItem(CLAVE_URL);
}

/**
 * Envía un registro a la hoja de cálculo.
 * Se usa 'no-cors' porque Apps Script no devuelve encabezados CORS: el
 * envío llega igual, aunque el navegador no nos deje leer la respuesta.
 */
async function enviarAHoja(registro) {
  const url = obtenerUrlHoja();
  if (!url) return false;   // sin hoja configurada, solo queda lo local

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(registro)
    });
    return true;
  } catch (error) {
    // Si falla la red, el avance local ya quedó guardado: nada se pierde
    console.warn('No se pudo enviar a la hoja de cálculo:', error);
    return false;
  }
}

/* ----- Interfaz que usa el resto de la app --------------------------- */

/**
 * Registra el resultado de una tablilla.
 *
 * @param {string} codigo    código del descifrador, por ejemplo 'D01'
 * @param {string} tablilla  identificador de la tablilla, por ejemplo 'D3'
 * @param {Object} resultado { ecosUsados, conteo, acreditada }
 */
async function registrar(codigo, tablilla, resultado) {
  // 1. Siempre se guarda primero en el navegador
  const avance = leerLocal();
  if (!avance[codigo]) avance[codigo] = {};

  avance[codigo][tablilla] = {
    ...resultado,
    fecha: new Date().toISOString()
  };
  guardarLocal(avance);

  // 2. Luego se intenta enviar a la hoja, si está configurada
  await enviarAHoja({
    codigo,
    tablilla,
    ecosUsados: resultado.ecosUsados,
    verdes: resultado.conteo.verde,
    amarillos: resultado.conteo.amarillo,
    grises: resultado.conteo.gris,
    acreditada: resultado.acreditada ? 'SI' : 'NO',
    fecha: new Date().toLocaleString('es-CO')
  });

  return avance[codigo];
}

/** Devuelve el avance de un descifrador. */
function avanceDe(codigo) {
  return leerLocal()[codigo] || {};
}

/** Borra el avance de un descifrador. Solo desde Ajustes y con confirmación. */
function borrarAvance(codigo) {
  const avance = leerLocal();
  delete avance[codigo];
  guardarLocal(avance);
}

export {
  registrar, avanceDe, borrarAvance,
  obtenerUrlHoja, definirUrlHoja
};
