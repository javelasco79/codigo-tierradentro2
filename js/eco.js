/* =========================================================================
   eco.js
   Lógica del código de tres marcas.

   Regla central: el eco se DETIENE en el primer gris. En álgebra un error
   se propaga, así que marcar todo lo que viene después le diría al
   estudiante que falló en todo cuando se equivocó una sola vez.

   Importante: este módulo NO decide si el estudiante acertó. Solo prepara
   la información que el verificador de otra brigada usará para marcar.
   La app asiste; el compañero es quien emite el eco.
   ========================================================================= */

// Las tres marcas posibles, cada una con su símbolo de respaldo
const MARCAS = {
  verde:    { simbolo: '●', nombre: 'Verde',    clase: 'marca--verde',
              sentido: 'Paso válido y en su lugar' },
  amarillo: { simbolo: '◐', nombre: 'Amarillo', clase: 'marca--amarillo',
              sentido: 'Conserva la igualdad, pero incompleto o fuera de orden' },
  gris:     { simbolo: '○', nombre: 'Gris',     clase: 'marca--gris',
              sentido: 'Aquí se rompió la equivalencia' }
};

/**
 * Construye el eco completo de una tablilla.
 *
 * @param {number} totalPasos  cuántas casillas tiene la ficha
 * @param {number} pasoFallido en qué paso está el error (1 = primero)
 * @param {string} marca       'gris' o 'amarillo'
 * @returns {Array} una entrada por casilla: { paso, marca, leido }
 *
 * Si la marca es GRIS, los pasos siguientes quedan sin leer.
 * Si es AMARILLO, la igualdad no se rompió, así que el eco continúa.
 */
function construirEco(totalPasos, pasoFallido, marca) {
  const eco = [];

  for (let paso = 1; paso <= totalPasos; paso++) {

    if (paso < pasoFallido) {
      // Todo lo anterior al error estaba bien resuelto
      eco.push({ paso, marca: 'verde', leido: true });

    } else if (paso === pasoFallido) {
      // Aquí está la marca que corresponda
      eco.push({ paso, marca: marca, leido: true });

    } else {
      // Después del error: depende de qué tipo de error fue
      if (marca === 'gris') {
        eco.push({ paso, marca: null, leido: false });  // el Archivo no lee más
      } else {
        eco.push({ paso, marca: 'verde', leido: true }); // el amarillo no corta
      }
    }
  }

  return eco;
}

/**
 * Compara el dictamen del estudiante con lo que realmente ocurre.
 * Se usa en el momento de Peritaje: el estudiante señala en qué paso cree
 * que se rompió la equivalencia, y esto revisa si acertó.
 *
 * @param {number} pasoSenalado  el paso que indicó el estudiante
 * @param {number} pasoReal      el paso donde de verdad está el error
 * @returns {Object} { acierta, mensaje }
 */
function revisarDictamen(pasoSenalado, pasoReal) {
  if (pasoSenalado === pasoReal) {
    return {
      acierta: true,
      mensaje: 'Dictamen correcto. Ubicaste el paso donde se rompe la igualdad.'
    };
  }

  // El mensaje orienta sin entregar la respuesta, tal como el eco
  if (pasoSenalado < pasoReal) {
    return {
      acierta: false,
      mensaje: 'Todavía no. Ese paso conserva la igualdad. Revisá un poco más adelante.'
    };
  }

  return {
    acierta: false,
    mensaje: 'Te pasaste. La igualdad ya venía rota desde antes de ese paso.'
  };
}

/**
 * Cuenta cuántas marcas de cada color tiene un eco.
 * Sirve para la bitácora: el avance se lee viendo bajar los grises.
 */
function contarMarcas(eco) {
  const conteo = { verde: 0, amarillo: 0, gris: 0, sinLeer: 0 };

  eco.forEach(casilla => {
    if (!casilla.leido) conteo.sinLeer++;
    else conteo[casilla.marca]++;
  });

  return conteo;
}

/**
 * Indica si quedan ecos disponibles.
 * Son tres por tablilla: suficientes para pensar, pocos para adivinar.
 */
const MAXIMO_ECOS = 3;

function quedanEcos(ecosUsados) {
  return ecosUsados < MAXIMO_ECOS;
}

export { MARCAS, MAXIMO_ECOS, construirEco, revisarDictamen, contarMarcas, quedanEcos };
