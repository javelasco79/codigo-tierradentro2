/* =========================================================================
   app.js
   Pantallas, navegación y armado de la interfaz.

   Estructura de la app:
     - Pantalla INICIO      : el descifrador escribe su código
     - Pantalla TABLILLAS   : lista de tablillas por nivel
     - Pantalla PERITAJE    : la transcripción adulterada y el dictamen
     - Pantalla VERIFICADOR : la clave de contraste (para otra brigada)
     - Pantalla MURAL       : sellos y avance del descifrador
     - Pantalla AJUSTES     : conexión con la hoja de cálculo
   ========================================================================= */

import { NIVELES, TABLILLAS } from './datos.js';
import { MARCAS, MAXIMO_ECOS, construirEco, revisarDictamen,
         contarMarcas, quedanEcos } from './eco.js';
import { registrar, avanceDe, obtenerUrlHoja, definirUrlHoja } from './almacenamiento.js';

/* ----- Estado de la sesión ------------------------------------------- */
const estado = {
  codigo: '',          // código del descifrador, por ejemplo 'D01'
  nivelActivo: 'acreditacion',
  tablillaActiva: null,
  ecosUsados: 0,
  dictamenAcertado: false
};

/* ----- Ayudas de presentación ---------------------------------------- */

/**
 * Convierte una expresión matemática en HTML.
 * Si KaTeX cargó, devuelve la fórmula bien presentada. Si no cargó, muestra
 * la versión en texto plano. El estudiante nunca ve código crudo.
 */
function mate(expresion) {
  if (window.katex) {
    try {
      return window.katex.renderToString(expresion.tex, {
        throwOnError: false,
        displayMode: false
      });
    } catch (error) {
      console.warn('KaTeX no pudo procesar:', expresion.tex);
    }
  }
  return escapar(expresion.texto);
}

/** Evita que un texto con símbolos rompa el HTML. */
function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/** Devuelve el HTML de una marca del eco, con color y símbolo. */
function pintarMarca(nombreMarca) {
  if (!nombreMarca) {
    return '<span class="marca marca--vacia">— sin leer</span>';
  }
  const m = MARCAS[nombreMarca];
  return `<span class="marca ${m.clase}">
            <span class="marca__simbolo">${m.simbolo}</span> ${m.nombre}
          </span>`;
}

/** Muestra una sola pantalla y esconde las demás. */
function mostrar(pantalla) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.add('oculto'));
  document.getElementById(pantalla).classList.remove('oculto');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ----- Pantalla INICIO ------------------------------------------------ */

function iniciarSesion() {
  const campo = document.getElementById('campo-codigo');
  const valor = campo.value.trim().toUpperCase();

  if (!valor) {
    document.getElementById('aviso-inicio').classList.remove('oculto');
    return;
  }

  estado.codigo = valor;
  document.getElementById('codigo-visible').textContent = valor;
  document.getElementById('barra-superior').classList.remove('oculto');

  dibujarTablillas();
  mostrar('pantalla-tablillas');
}

/* ----- Pantalla TABLILLAS -------------------------------------------- */

function dibujarNavegacion() {
  const nav = document.getElementById('navegacion');

  nav.innerHTML = Object.keys(NIVELES).map(clave => `
    <button class="navegacion__boton ${clave === estado.nivelActivo ? 'activo' : ''}"
            data-nivel="${clave}">
      ${NIVELES[clave].nombre}
    </button>
  `).join('');

  nav.querySelectorAll('.navegacion__boton').forEach(boton => {
    boton.addEventListener('click', () => {
      estado.nivelActivo = boton.dataset.nivel;
      dibujarTablillas();
    });
  });
}

function dibujarTablillas() {
  dibujarNavegacion();

  const nivel = NIVELES[estado.nivelActivo];
  const avance = avanceDe(estado.codigo);
  const lista = TABLILLAS.filter(t => t.nivel === estado.nivelActivo);

  document.getElementById('descripcion-nivel').textContent = nivel.descripcion;

  document.getElementById('rejilla-tablillas').innerHTML = lista.map(t => {
    const hecha = avance[t.id];
    const estadoTexto = hecha
      ? `Acreditada con ${hecha.ecosUsados} eco(s)`
      : 'Sin abrir';

    return `
      <button class="tablilla-card" data-id="${t.id}">
        <span class="etiqueta-nivel ${nivel.color}">${t.titulo}</span>
        <div class="tablilla-card__expresion">${mate(t.enunciado)}</div>
        <div class="tablilla-card__estado">
          ${hecha ? '✔ ' : ''}${estadoTexto}
        </div>
      </button>
    `;
  }).join('');

  document.querySelectorAll('.tablilla-card').forEach(card => {
    card.addEventListener('click', () => abrirTablilla(card.dataset.id));
  });
}

/* ----- Pantalla PERITAJE --------------------------------------------- */

function abrirTablilla(id) {
  estado.tablillaActiva = TABLILLAS.find(t => t.id === id);
  estado.ecosUsados = 0;
  estado.dictamenAcertado = false;

  dibujarPeritaje();
  mostrar('pantalla-peritaje');
}

function dibujarPeritaje() {
  const t = estado.tablillaActiva;
  const nivel = NIVELES[t.nivel];

  document.getElementById('titulo-peritaje').innerHTML =
    `${t.titulo} <span class="etiqueta-nivel ${nivel.color}">${nivel.nombre}</span>`;

  document.getElementById('enunciado-peritaje').innerHTML = mate(t.enunciado);

  dibujarContadorEcos();

  // La transcripción llega adulterada: hay que hallar dónde se dañó
  document.getElementById('filas-peritaje').innerHTML = t.adulterada.map((paso, i) => `
    <div class="ficha__fila">
      <span class="ficha__numero">${i + 1}</span>
      <span class="ficha__paso">${mate(paso)}</span>
      <button class="boton boton--secundario boton-dictamen"
              data-paso="${i + 1}" style="padding:7px 12px;min-height:38px;">
        Señalar
      </button>
    </div>
  `).join('');

  document.querySelectorAll('.boton-dictamen').forEach(boton => {
    boton.addEventListener('click', () => emitirDictamen(Number(boton.dataset.paso)));
  });

  document.getElementById('resultado-peritaje').innerHTML = '';
  document.getElementById('acciones-peritaje').classList.add('oculto');
}

function dibujarContadorEcos() {
  const puntos = Array.from({ length: MAXIMO_ECOS }, (_, i) =>
    `<span class="ecos__punto ${i < estado.ecosUsados ? 'usado' : ''}"></span>`
  ).join('');

  document.getElementById('contador-ecos').innerHTML = `
    <span>Ecos disponibles</span> ${puntos}
    <span>${MAXIMO_ECOS - estado.ecosUsados} de ${MAXIMO_ECOS}</span>
  `;
}

/**
 * El estudiante señala en qué paso cree que se rompió la equivalencia.
 * Cada intento consume un eco. El Archivo nunca dice cuál era el correcto.
 */
function emitirDictamen(pasoSenalado) {
  const t = estado.tablillaActiva;

  if (!quedanEcos(estado.ecosUsados)) return;

  estado.ecosUsados++;
  dibujarContadorEcos();

  const revision = revisarDictamen(pasoSenalado, t.pasoFallido);
  const caja = document.getElementById('resultado-peritaje');

  if (revision.acierta) {
    estado.dictamenAcertado = true;
    caja.innerHTML = `<div class="aviso aviso--logro"><strong>${revision.mensaje}</strong></div>`;
    revelarEco();

  } else if (!quedanEcos(estado.ecosUsados)) {
    // Se agotaron los tres ecos: se muestra el eco y quedan las dos salidas
    caja.innerHTML = `
      <div class="aviso aviso--alerta">
        <strong>${revision.mensaje}</strong><br>
        Se agotaron los tres ecos de esta tablilla.
      </div>`;
    revelarEco();

  } else {
    caja.innerHTML = `<div class="aviso">${revision.mensaje}</div>`;
  }
}

/** Muestra la ficha con el eco completo y la explicación del error. */
function revelarEco() {
  const t = estado.tablillaActiva;
  const eco = construirEco(t.casillas, t.pasoFallido, t.marca);

  document.getElementById('filas-peritaje').innerHTML = t.adulterada.map((paso, i) => {
    const casilla = eco[i];
    return `
      <div class="ficha__fila ${casilla.leido ? '' : 'sin-leer'}">
        <span class="ficha__numero">${i + 1}</span>
        <span class="ficha__paso">${mate(paso)}</span>
        <span class="ficha__marca">${pintarMarca(casilla.marca)}</span>
      </div>
    `;
  }).join('');

  // La explicación aparece solo ahora, nunca antes del dictamen
  document.getElementById('resultado-peritaje').innerHTML += `
    <div class="aviso"><strong>Qué ocurrió:</strong> ${escapar(t.explicacion)}</div>
    ${t.marca === 'gris' ? `
      <div class="aviso aviso--alerta">
        El eco se detiene en el primer gris: el Archivo no lee más allá de la ruptura.
      </div>` : `
      <div class="aviso">
        Marca amarilla: la igualdad se conserva, así que el eco continúa.
      </div>`}
  `;

  document.getElementById('acciones-peritaje').classList.remove('oculto');
}

/** Guarda el resultado y vuelve a la lista de tablillas. */
async function acreditarTablilla() {
  const t = estado.tablillaActiva;
  const eco = construirEco(t.casillas, t.pasoFallido, t.marca);

  await registrar(estado.codigo, t.id, {
    ecosUsados: estado.ecosUsados,
    conteo: contarMarcas(eco),
    acreditada: estado.dictamenAcertado
  });

  dibujarTablillas();
  mostrar('pantalla-tablillas');
}

/* ----- Pantalla VERIFICADOR ------------------------------------------ */

/**
 * Muestra la clave de contraste de una tablilla.
 * La usa el verificador de OTRA brigada para marcar la ficha en papel de un
 * compañero. La app no marca por él: solo le muestra el procedimiento.
 */
function dibujarVerificador() {
  const selector = document.getElementById('selector-clave');

  selector.innerHTML = '<option value="">Elegí una tablilla…</option>' +
    TABLILLAS.map(t =>
      `<option value="${t.id}">${t.titulo} · ${NIVELES[t.nivel].nombre}</option>`
    ).join('');

  selector.addEventListener('change', () => {
    const t = TABLILLAS.find(x => x.id === selector.value);
    const caja = document.getElementById('contenido-clave');

    if (!t) { caja.innerHTML = ''; return; }

    caja.innerHTML = `
      <div class="tarjeta">
        <div class="tarjeta__titulo">
          <h3>${t.titulo}</h3>
          <span class="etiqueta-nivel ${NIVELES[t.nivel].color}">${NIVELES[t.nivel].nombre}</span>
        </div>
        <p class="texto-suave">Enunciado</p>
        <div class="tablilla-card__expresion">${mate(t.enunciado)}</div>
        <div class="ficha">
          ${t.clave.map((paso, i) => `
            <div class="ficha__fila">
              <span class="ficha__numero">${i + 1}</span>
              <span class="ficha__paso">${mate(paso)}</span>
              <span class="ficha__marca">${pintarMarca('verde')}</span>
            </div>`).join('')}
        </div>
        <div class="aviso aviso--alerta">
          No muestres esta pantalla al descifrador y no le digas el paso correcto.
          Solo marcá su ficha con los tres colores.
        </div>
      </div>
    `;
  });
}

/* ----- Pantalla MURAL ------------------------------------------------- */

const SELLOS = [
  { nombre: 'Observar',  nivel: 'acreditacion', icono: '👁' },
  { nombre: 'Descifrar', nivel: 'despeje',      icono: '🔑' },
  { nombre: 'Auditar',   nivel: 'camara',       icono: '🔍' },
  { nombre: 'Sellar',    nivel: null,           icono: '🏛' }
];

function dibujarMural() {
  const avance = avanceDe(estado.codigo);

  document.getElementById('mural').innerHTML = SELLOS.map(sello => {
    let hechas = 0, total = 0;

    if (sello.nivel) {
      const delNivel = TABLILLAS.filter(t => t.nivel === sello.nivel);
      total = delNivel.length;
      hechas = delNivel.filter(t => avance[t.id] && avance[t.id].acreditada).length;
    } else {
      // El sello Sellar exige haber acreditado todas las tablillas
      total = TABLILLAS.length;
      hechas = TABLILLAS.filter(t => avance[t.id] && avance[t.id].acreditada).length;
    }

    const logrado = total > 0 && hechas === total;

    return `
      <div class="sello ${logrado ? 'logrado' : ''}">
        <div class="sello__icono">${sello.icono}</div>
        <div class="sello__nombre">${sello.nombre}</div>
        <div class="sello__detalle">${hechas} de ${total}</div>
      </div>
    `;
  }).join('');

  // Resumen de grises: es el indicador de avance real del estudiante
  const registros = Object.values(avance);
  const grises = registros.reduce((suma, r) => suma + (r.conteo ? r.conteo.gris : 0), 0);

  document.getElementById('resumen-mural').innerHTML = registros.length
    ? `<div class="aviso">Tablillas trabajadas: <strong>${registros.length}</strong>.
        Grises acumulados: <strong>${grises}</strong>.
        El avance se lee viendo bajar ese número con las semanas.</div>`
    : `<div class="aviso">Todavía no hay tablillas registradas para ${escapar(estado.codigo)}.</div>`;
}

/* ----- Pantalla AJUSTES ---------------------------------------------- */

function dibujarAjustes() {
  document.getElementById('campo-hoja').value = obtenerUrlHoja();
}

function guardarAjustes() {
  definirUrlHoja(document.getElementById('campo-hoja').value);
  document.getElementById('aviso-ajustes').classList.remove('oculto');
  setTimeout(() => {
    document.getElementById('aviso-ajustes').classList.add('oculto');
  }, 2500);
}

/* ----- Conexión de todos los botones --------------------------------- */

function conectarEventos() {
  document.getElementById('boton-entrar')
    .addEventListener('click', iniciarSesion);

  // Permite entrar con la tecla Enter, cómodo en celular
  document.getElementById('campo-codigo')
    .addEventListener('keydown', e => { if (e.key === 'Enter') iniciarSesion(); });

  document.getElementById('boton-acreditar')
    .addEventListener('click', acreditarTablilla);

  document.getElementById('boton-volver')
    .addEventListener('click', () => { dibujarTablillas(); mostrar('pantalla-tablillas'); });

  document.getElementById('ir-tablillas')
    .addEventListener('click', () => { dibujarTablillas(); mostrar('pantalla-tablillas'); });

  document.getElementById('ir-verificador')
    .addEventListener('click', () => mostrar('pantalla-verificador'));

  document.getElementById('ir-mural')
    .addEventListener('click', () => { dibujarMural(); mostrar('pantalla-mural'); });

  document.getElementById('ir-ajustes')
    .addEventListener('click', () => { dibujarAjustes(); mostrar('pantalla-ajustes'); });

  document.getElementById('boton-guardar-hoja')
    .addEventListener('click', guardarAjustes);
}

/* ----- Arranque ------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  conectarEventos();
  dibujarVerificador();
  mostrar('pantalla-inicio');
});
