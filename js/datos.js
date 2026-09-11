/* =========================================================================
   datos.js
   Banco de tablillas del Archivo de Signos de Tierradentro.

   Cada tablilla contiene:
     - id / nivel / titulo : identificación y ubicación en la progresión
     - enunciado           : lo que el estudiante debe resolver
     - casillas            : cuántos pasos tiene la ficha de eco
     - clave               : el procedimiento correcto (SOLO lo ve el verificador)
     - adulterada          : transcripción con un error puesto a propósito
     - pasoFallido         : en qué paso se rompe la equivalencia
     - marca               : 'gris' si rompe la igualdad, 'amarillo' si es
                             válida pero incompleta o fuera de orden

   Cada expresión matemática se guarda por duplicado:
     - tex   : versión LaTeX, que KaTeX convierte en fórmula bien presentada
     - texto : versión en texto plano, que se muestra si KaTeX no carga
   Así el estudiante nunca ve código roto en pantalla.

   Todas las soluciones fueron verificadas con álgebra simbólica.
   ========================================================================= */

const NIVELES = {
  acreditacion: {
    nombre: 'Acreditación',
    sello: 'Observar',
    color: 'nivel-1',
    descripcion: 'Signos y operaciones con enteros. Aquí se firma el carné de descifrador.'
  },
  despeje: {
    nombre: 'El despeje',
    sello: 'Descifrar',
    color: 'nivel-2',
    descripcion: 'Ecuaciones de primer grado. Cada signo se revela al resolver.'
  },
  camara: {
    nombre: 'La cámara sellada',
    sello: 'Auditar',
    color: 'nivel-3',
    descripcion: 'Factorización. La cámara solo abre si la expresión se descompone.'
  }
};

const TABLILLAS = [

  /* ---------------------------------------------------------------------
     NIVEL 1 · ACREDITACIÓN  (3 casillas)
     Recupera los prerrequisitos de grado octavo sin exponer al estudiante:
     el primer trabajo del periodo es hallar el error de otro, no resolver.
     --------------------------------------------------------------------- */

  {
    id: 'A1',
    nivel: 'acreditacion',
    titulo: 'Tablilla A1',
    casillas: 3,
    enunciado: { tex: '-8 + (-5) - (-3)', texto: '−8 + (−5) − (−3)' },
    clave: [
      { tex: '-8 - 5 + 3', texto: '−8 − 5 + 3' },
      { tex: '-13 + 3', texto: '−13 + 3' },
      { tex: '-10', texto: '−10' }
    ],
    adulterada: [
      { tex: '-8 - 5 - 3', texto: '−8 − 5 − 3' },
      { tex: '-13 - 3', texto: '−13 − 3' },
      { tex: '-16', texto: '−16' }
    ],
    pasoFallido: 1,
    marca: 'gris',
    // Solo se muestra DESPUÉS de que el estudiante emite su dictamen
    explicacion: 'Restar un negativo equivale a sumar. El −(−3) debía quedar como +3.'
  },

  {
    id: 'A2',
    nivel: 'acreditacion',
    titulo: 'Tablilla A2',
    casillas: 3,
    enunciado: { tex: '(-6)(-4) + (-7)(2)', texto: '(−6)(−4) + (−7)(2)' },
    clave: [
      { tex: '24 + (-14)', texto: '24 + (−14)' },
      { tex: '24 - 14', texto: '24 − 14' },
      { tex: '10', texto: '10' }
    ],
    adulterada: [
      { tex: '-24 + (-14)', texto: '−24 + (−14)' },
      { tex: '-24 - 14', texto: '−24 − 14' },
      { tex: '-38', texto: '−38' }
    ],
    pasoFallido: 1,
    marca: 'gris',
    explicacion: 'El producto de dos números negativos es positivo: (−6)(−4) = 24.'
  },

  {
    id: 'A3',
    nivel: 'acreditacion',
    titulo: 'Tablilla A3',
    casillas: 3,
    enunciado: { tex: '-3(4 - 9) - 2', texto: '−3(4 − 9) − 2' },
    clave: [
      { tex: '-3(-5) - 2', texto: '−3(−5) − 2' },
      { tex: '15 - 2', texto: '15 − 2' },
      { tex: '13', texto: '13' }
    ],
    adulterada: [
      { tex: '-3(-5) - 2', texto: '−3(−5) − 2' },
      { tex: '-15 - 2', texto: '−15 − 2' },
      { tex: '-17', texto: '−17' }
    ],
    pasoFallido: 2,
    marca: 'gris',
    explicacion: 'El paso 1 estaba bien resuelto. (−3)(−5) da 15 y no −15.'
  },

  {
    id: 'A4',
    nivel: 'acreditacion',
    titulo: 'Tablilla A4',
    casillas: 3,
    enunciado: { tex: '(-12) \\div (-3) - 5(-2)', texto: '(−12) ÷ (−3) − 5(−2)' },
    clave: [
      { tex: '4 - (-10)', texto: '4 − (−10)' },
      { tex: '4 + 10', texto: '4 + 10' },
      { tex: '14', texto: '14' }
    ],
    adulterada: [
      { tex: '4 - (-10)', texto: '4 − (−10)' },
      { tex: '4 - 10', texto: '4 − 10' },
      { tex: '-6', texto: '−6' }
    ],
    pasoFallido: 2,
    marca: 'gris',
    explicacion: 'Restar −10 es sumar 10. El paso 1 venía correcto.'
  },

  /* ---------------------------------------------------------------------
     NIVEL 2 · EL DESPEJE  (5 casillas)
     La quinta casilla es siempre la verificación: obliga a comprobar,
     que es justo lo que los estudiantes hoy no hacen.
     --------------------------------------------------------------------- */

  {
    id: 'D1',
    nivel: 'despeje',
    titulo: 'Tablilla D1',
    casillas: 5,
    enunciado: { tex: '4x - 7 = 2x + 9', texto: '4x − 7 = 2x + 9' },
    clave: [
      { tex: '4x - 2x = 9 + 7', texto: '4x − 2x = 9 + 7' },
      { tex: '2x = 16', texto: '2x = 16' },
      { tex: 'x = \\frac{16}{2}', texto: 'x = 16 / 2' },
      { tex: 'x = 8', texto: 'x = 8' },
      { tex: '4(8) - 7 = 25 \\;;\\; 2(8) + 9 = 25', texto: '4(8) − 7 = 25 ; 2(8) + 9 = 25' }
    ],
    adulterada: [
      { tex: '4x - 2x = 9 - 7', texto: '4x − 2x = 9 − 7' },
      { tex: '2x = 2', texto: '2x = 2' },
      { tex: 'x = \\frac{2}{2}', texto: 'x = 2 / 2' },
      { tex: 'x = 1', texto: 'x = 1' },
      { tex: '4(1) - 7 = -3 \\;;\\; 2(1) + 9 = 11', texto: '4(1) − 7 = −3 ; 2(1) + 9 = 11' }
    ],
    pasoFallido: 1,
    marca: 'gris',
    explicacion: 'Al pasar el −7 al otro lado debe sumarse, no restarse.'
  },

  {
    id: 'D2',
    nivel: 'despeje',
    titulo: 'Tablilla D2',
    casillas: 5,
    enunciado: { tex: '7x + 3 = 4x - 15', texto: '7x + 3 = 4x − 15' },
    clave: [
      { tex: '7x - 4x = -15 - 3', texto: '7x − 4x = −15 − 3' },
      { tex: '3x = -18', texto: '3x = −18' },
      { tex: 'x = \\frac{-18}{3}', texto: 'x = −18 / 3' },
      { tex: 'x = -6', texto: 'x = −6' },
      { tex: '7(-6) + 3 = -39 \\;;\\; 4(-6) - 15 = -39', texto: '7(−6) + 3 = −39 ; 4(−6) − 15 = −39' }
    ],
    adulterada: [
      { tex: '7x - 4x = -15 + 3', texto: '7x − 4x = −15 + 3' },
      { tex: '3x = -12', texto: '3x = −12' },
      { tex: 'x = \\frac{-12}{3}', texto: 'x = −12 / 3' },
      { tex: 'x = -4', texto: 'x = −4' },
      { tex: '7(-4) + 3 = -25 \\;;\\; 4(-4) - 15 = -31', texto: '7(−4) + 3 = −25 ; 4(−4) − 15 = −31' }
    ],
    pasoFallido: 1,
    marca: 'gris',
    explicacion: 'El +3 pasa al otro lado como −3.'
  },

  {
    id: 'D3',
    nivel: 'despeje',
    titulo: 'Tablilla D3',
    casillas: 5,
    enunciado: { tex: '3(x - 2) = 5x + 4', texto: '3(x − 2) = 5x + 4' },
    clave: [
      { tex: '3x - 6 = 5x + 4', texto: '3x − 6 = 5x + 4' },
      { tex: '3x - 5x = 4 + 6', texto: '3x − 5x = 4 + 6' },
      { tex: '-2x = 10', texto: '−2x = 10' },
      { tex: 'x = -5', texto: 'x = −5' },
      { tex: '3(-5 - 2) = -21 \\;;\\; 5(-5) + 4 = -21', texto: '3(−5 − 2) = −21 ; 5(−5) + 4 = −21' }
    ],
    adulterada: [
      { tex: '3x - 6 = 5x + 4', texto: '3x − 6 = 5x + 4' },
      { tex: '3x - 5x = 4 - 6', texto: '3x − 5x = 4 − 6' },
      { tex: '-2x = -2', texto: '−2x = −2' },
      { tex: 'x = 1', texto: 'x = 1' },
      { tex: '3(1 - 2) = -3 \\;;\\; 5(1) + 4 = 9', texto: '3(1 − 2) = −3 ; 5(1) + 4 = 9' }
    ],
    pasoFallido: 2,
    marca: 'gris',
    explicacion: 'La distributiva del paso 1 estaba bien. Al pasar el −6 debía sumarse: 4 + 6.'
  },

  {
    id: 'D4',
    nivel: 'despeje',
    titulo: 'Tablilla D4',
    casillas: 5,
    enunciado: { tex: '3(2x - 1) = 4x + 7', texto: '3(2x − 1) = 4x + 7' },
    clave: [
      { tex: '6x - 3 = 4x + 7', texto: '6x − 3 = 4x + 7' },
      { tex: '6x - 4x = 7 + 3', texto: '6x − 4x = 7 + 3' },
      { tex: '2x = 10', texto: '2x = 10' },
      { tex: 'x = 5', texto: 'x = 5' },
      { tex: '3(2 \\cdot 5 - 1) = 27 \\;;\\; 4(5) + 7 = 27', texto: '3(2·5 − 1) = 27 ; 4(5) + 7 = 27' }
    ],
    adulterada: [
      { tex: '6x - 1 = 4x + 7', texto: '6x − 1 = 4x + 7' },
      { tex: '6x - 4x = 7 + 1', texto: '6x − 4x = 7 + 1' },
      { tex: '2x = 8', texto: '2x = 8' },
      { tex: 'x = 4', texto: 'x = 4' },
      { tex: '3(2 \\cdot 4 - 1) = 21 \\;;\\; 4(4) + 7 = 23', texto: '3(2·4 − 1) = 21 ; 4(4) + 7 = 23' }
    ],
    pasoFallido: 1,
    marca: 'gris',
    explicacion: 'El 3 multiplica a los dos términos del paréntesis, también al −1.'
  },

  /* ---------------------------------------------------------------------
     NIVEL 3 · LA CÁMARA SELLADA  (4 casillas)
     F1 es el único caso de marca AMARILLA del banco: el resultado equivale
     al original, pero la factorización quedó incompleta.
     --------------------------------------------------------------------- */

  {
    id: 'F1',
    nivel: 'camara',
    titulo: 'Cámara F1',
    casillas: 4,
    enunciado: { tex: '6x^2 + 9x', texto: '6x² + 9x' },
    clave: [
      { tex: '\\text{Tipo: factor común}', texto: 'Tipo: factor común' },
      { tex: '\\text{Factor común: } 3x', texto: 'Factor común: 3x' },
      { tex: '3x(2x + 3)', texto: '3x(2x + 3)' },
      { tex: '3x \\cdot 2x + 3x \\cdot 3 = 6x^2 + 9x', texto: '3x·2x + 3x·3 = 6x² + 9x' }
    ],
    adulterada: [
      { tex: '\\text{Tipo: factor común}', texto: 'Tipo: factor común' },
      { tex: '\\text{Factor común: } 3', texto: 'Factor común: 3' },
      { tex: '3(2x^2 + 3x)', texto: '3(2x² + 3x)' },
      { tex: '3 \\cdot 2x^2 + 3 \\cdot 3x = 6x^2 + 9x', texto: '3·2x² + 3·3x = 6x² + 9x' }
    ],
    pasoFallido: 2,
    marca: 'amarillo',
    explicacion: 'La igualdad se conserva, pero la factorización quedó incompleta: falta extraer también la x.'
  },

  {
    id: 'F2',
    nivel: 'camara',
    titulo: 'Cámara F2',
    casillas: 4,
    enunciado: { tex: 'x^2 - 49', texto: 'x² − 49' },
    clave: [
      { tex: '\\text{Tipo: diferencia de cuadrados}', texto: 'Tipo: diferencia de cuadrados' },
      { tex: '\\text{Raíces: } x \\text{ y } 7', texto: 'Raíces: x y 7' },
      { tex: '(x - 7)(x + 7)', texto: '(x − 7)(x + 7)' },
      { tex: 'x^2 + 7x - 7x - 49 = x^2 - 49', texto: 'x² + 7x − 7x − 49 = x² − 49' }
    ],
    adulterada: [
      { tex: '\\text{Tipo: diferencia de cuadrados}', texto: 'Tipo: diferencia de cuadrados' },
      { tex: '\\text{Raíces: } x \\text{ y } 7', texto: 'Raíces: x y 7' },
      { tex: '(x - 7)(x - 7)', texto: '(x − 7)(x − 7)' },
      { tex: 'x^2 - 14x + 49', texto: 'x² − 14x + 49' }
    ],
    pasoFallido: 3,
    marca: 'gris',
    explicacion: 'Una diferencia de cuadrados da dos factores con signos opuestos, no iguales.'
  },

  {
    id: 'F3',
    nivel: 'camara',
    titulo: 'Cámara F3',
    casillas: 4,
    enunciado: { tex: 'x^2 + 7x + 12', texto: 'x² + 7x + 12' },
    clave: [
      { tex: '\\text{Tipo: trinomio } x^2 + bx + c', texto: 'Tipo: trinomio x² + bx + c' },
      { tex: '\\text{Multiplican } 12 \\text{ y suman } 7: \\; 3 \\text{ y } 4', texto: 'Multiplican 12 y suman 7: 3 y 4' },
      { tex: '(x + 3)(x + 4)', texto: '(x + 3)(x + 4)' },
      { tex: 'x^2 + 4x + 3x + 12 = x^2 + 7x + 12', texto: 'x² + 4x + 3x + 12 = x² + 7x + 12' }
    ],
    adulterada: [
      { tex: '\\text{Tipo: trinomio } x^2 + bx + c', texto: 'Tipo: trinomio x² + bx + c' },
      { tex: '\\text{Multiplican } 12: \\; 6 \\text{ y } 2', texto: 'Multiplican 12: 6 y 2' },
      { tex: '(x + 6)(x + 2)', texto: '(x + 6)(x + 2)' },
      { tex: 'x^2 + 8x + 12', texto: 'x² + 8x + 12' }
    ],
    pasoFallido: 2,
    marca: 'gris',
    explicacion: '6 y 2 multiplican 12, pero suman 8 y no 7. Deben cumplirse las dos condiciones.'
  },

  {
    id: 'F4',
    nivel: 'camara',
    titulo: 'Cámara F4',
    casillas: 4,
    enunciado: { tex: 'x^2 - 5x - 14', texto: 'x² − 5x − 14' },
    clave: [
      { tex: '\\text{Tipo: trinomio } x^2 + bx + c', texto: 'Tipo: trinomio x² + bx + c' },
      { tex: '\\text{Multiplican } -14 \\text{ y suman } -5: \\; -7 \\text{ y } 2', texto: 'Multiplican −14 y suman −5: −7 y 2' },
      { tex: '(x - 7)(x + 2)', texto: '(x − 7)(x + 2)' },
      { tex: 'x^2 + 2x - 7x - 14 = x^2 - 5x - 14', texto: 'x² + 2x − 7x − 14 = x² − 5x − 14' }
    ],
    adulterada: [
      { tex: '\\text{Tipo: trinomio } x^2 + bx + c', texto: 'Tipo: trinomio x² + bx + c' },
      { tex: '\\text{Multiplican } -14: \\; 7 \\text{ y } -2', texto: 'Multiplican −14: 7 y −2' },
      { tex: '(x + 7)(x - 2)', texto: '(x + 7)(x − 2)' },
      { tex: 'x^2 + 5x - 14', texto: 'x² + 5x − 14' }
    ],
    pasoFallido: 2,
    marca: 'gris',
    explicacion: 'Los signos están invertidos: 7 y −2 suman 5, pero se necesita −5.'
  }
];

// Se exponen para que los demás módulos puedan usarlos
export { NIVELES, TABLILLAS };
