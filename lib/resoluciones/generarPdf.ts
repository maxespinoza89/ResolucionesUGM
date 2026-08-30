import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";

// ---------- Tipos ----------
export type FirmaEmisor = {
  nombre: string;
  cargo: string;
  unidad: string;
};

export type FirmaSecretaria = {
  nombre: string;
  cargo: string;
  iniciales: string;
};

export type DatosResolucion = {
  unidadEmisora: string; // "FACULTAD DE NEGOCIOS Y TECNOLOGÍAS"
  tituloEncabezado: string; // "RESUELVE REINCORPORACIÓN QUE SE INDICA"
  fechaLarga: string; // "11 de agosto de 2026"
  numero: number;
  anio: number;
  vistos: string[]; // ya con variables reemplazadas
  articulos: string[]; // ya con variables reemplazadas
  firmaEmisor: FirmaEmisor;
  firmaSecretaria: FirmaSecretaria;
  distribucion: string[];
  inicialesTipeo: string; // iniciales de quien generó el documento en el sistema
};

// ---------- Config de página ----------
const ANCHO = 612; // carta
const ALTO = 792;
const MARGEN = 56;
const ANCHO_UTIL = ANCHO - MARGEN * 2;

function envolverTexto(
  texto: string,
  fuente: PDFFont,
  tamano: number,
  anchoMax: number
): string[] {
  const palabras = texto.split(" ");
  const lineas: string[] = [];
  let lineaActual = "";

  for (const palabra of palabras) {
    const prueba = lineaActual ? `${lineaActual} ${palabra}` : palabra;
    if (fuente.widthOfTextAtSize(prueba, tamano) > anchoMax && lineaActual) {
      lineas.push(lineaActual);
      lineaActual = palabra;
    } else {
      lineaActual = prueba;
    }
  }
  if (lineaActual) lineas.push(lineaActual);
  return lineas;
}

export async function generarPdfResolucion(
  datos: DatosResolucion
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fuenteNormal = await pdf.embedFont(StandardFonts.Helvetica);
  const fuenteNegrita = await pdf.embedFont(StandardFonts.HelveticaBold);

  let pagina = pdf.addPage([ANCHO, ALTO]);
  let y = ALTO - MARGEN;

  const negro = rgb(0.1, 0.1, 0.1);

  function nuevaPaginaSiNecesario(alturaNecesaria: number) {
    if (y - alturaNecesaria < MARGEN) {
      pagina = pdf.addPage([ANCHO, ALTO]);
      y = ALTO - MARGEN;
    }
  }

  function dibujarParrafo(
    texto: string,
    opciones: {
      fuente?: PDFFont;
      tamano?: number;
      x?: number;
      anchoMax?: number;
      interlineado?: number;
      centrado?: boolean;
      prefijoNegrita?: string; // ej. "Artículo Primero: " en negrita, resto normal
    } = {}
  ) {
    const fuente = opciones.fuente ?? fuenteNormal;
    const tamano = opciones.tamano ?? 10.5;
    const x = opciones.x ?? MARGEN;
    const anchoMax = opciones.anchoMax ?? ANCHO_UTIL;
    const interlineado = opciones.interlineado ?? tamano * 1.4;

    if (opciones.prefijoNegrita) {
      const anchoPrefijo = fuenteNegrita.widthOfTextAtSize(
        opciones.prefijoNegrita,
        tamano
      );
      const lineas = envolverTexto(
        texto,
        fuente,
        tamano,
        anchoMax - anchoPrefijo
      );
      nuevaPaginaSiNecesario(interlineado * lineas.length);
      pagina.drawText(opciones.prefijoNegrita, {
        x,
        y,
        size: tamano,
        font: fuenteNegrita,
        color: negro,
      });
      pagina.drawText(lineas[0] ?? "", {
        x: x + anchoPrefijo,
        y,
        size: tamano,
        font: fuente,
        color: negro,
      });
      y -= interlineado;
      for (let i = 1; i < lineas.length; i++) {
        pagina.drawText(lineas[i], { x, y, size: tamano, font: fuente, color: negro });
        y -= interlineado;
      }
      return;
    }

    const lineas = envolverTexto(texto, fuente, tamano, anchoMax);
    nuevaPaginaSiNecesario(interlineado * lineas.length);
    for (const linea of lineas) {
      if (opciones.centrado) {
        const anchoLinea = fuente.widthOfTextAtSize(linea, tamano);
        pagina.drawText(linea, {
          x: (ANCHO - anchoLinea) / 2,
          y,
          size: tamano,
          font: fuente,
          color: negro,
        });
      } else {
        pagina.drawText(linea, { x, y, size: tamano, font: fuente, color: negro });
      }
      y -= interlineado;
    }
  }

  // ---------- Encabezado ----------
  const yEncabezadoInicio = y;

  // Bloque derecho (unidad, título, línea, fecha, número)
  const xDerecha = MARGEN + 150;
  const anchoDerecha = ANCHO_UTIL - 150;
  let yDer = yEncabezadoInicio;

  pagina.drawText(datos.unidadEmisora, {
    x: xDerecha,
    y: yDer,
    size: 10,
    font: fuenteNegrita,
    color: negro,
  });
  yDer -= 13;

  const lineasTitulo = envolverTexto(datos.tituloEncabezado, fuenteNegrita, 10, anchoDerecha);
  for (const l of lineasTitulo) {
    pagina.drawText(l, { x: xDerecha, y: yDer, size: 10, font: fuenteNegrita, color: negro });
    yDer -= 13;
  }

  yDer -= 4;
  pagina.drawLine({
    start: { x: xDerecha, y: yDer },
    end: { x: xDerecha + anchoDerecha, y: yDer },
    thickness: 0.75,
    color: negro,
  });
  yDer -= 16;

  pagina.drawText(`Santiago, ${datos.fechaLarga}`, {
    x: xDerecha,
    y: yDer,
    size: 10,
    font: fuenteNormal,
    color: negro,
  });
  yDer -= 14;

  pagina.drawText(`RESOLUCIÓN N°${datos.numero}/${datos.anio}`, {
    x: xDerecha,
    y: yDer,
    size: 10,
    font: fuenteNegrita,
    color: negro,
  });
  yDer -= 14;

  // Bloque izquierdo: espacio reservado para el logo (se agrega en un paso
  // posterior insertando la imagen institucional con pdf.embedPng).
  pagina.drawRectangle({
    x: MARGEN,
    y: yEncabezadoInicio - 60,
    width: 120,
    height: 60,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.5,
  });
  pagina.drawText("[ LOGO ]", {
    x: MARGEN + 38,
    y: yEncabezadoInicio - 34,
    size: 9,
    font: fuenteNormal,
    color: rgb(0.6, 0.6, 0.6),
  });

  y = Math.min(yDer, yEncabezadoInicio - 70) - 24;

  // ---------- VISTOS Y CONSIDERANDO ----------
  dibujarParrafo("VISTOS Y CONSIDERANDO", {
    fuente: fuenteNegrita,
    tamano: 11,
  });
  y -= 6;

  datos.vistos.forEach((punto, i) => {
    dibujarParrafo(`${i + 1}. ${punto}`, { anchoMax: ANCHO_UTIL - 14, x: MARGEN + 14 });
    y -= 6;
  });

  y -= 4;

  // ---------- RESUELVO ----------
  dibujarParrafo("RESUELVO,", { fuente: fuenteNegrita, tamano: 11 });
  y -= 6;

  const esUnico = datos.articulos.length === 1;
  const ordinales = [
    "Primero", "Segundo", "Tercero", "Cuarto", "Quinto",
    "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo",
  ];

  datos.articulos.forEach((texto, i) => {
    const etiqueta = esUnico ? "Artículo Único" : `Artículo ${ordinales[i] ?? i + 1}`;
    dibujarParrafo(texto, { prefijoNegrita: `${etiqueta}: ` });
    y -= 10;
  });

  y -= 10;

  // ---------- Cierre ----------
  // Nota: idealmente esta línea y todo lo que sigue no debería cortarse
  // entre páginas. Se reserva espacio mínimo estimado antes de dibujarla;
  // el ajuste fino de paginación queda pendiente de una revisión con
  // casos reales largos.
  nuevaPaginaSiNecesario(220);
  dibujarParrafo("ANÓTESE, COMUNÍQUESE Y ARCHÍVESE", {
    fuente: fuenteNegrita,
    tamano: 11,
    centrado: true,
  });

  y -= 60;

  // ---------- Firmas ----------
  const yFirmas = y;
  // Firma derecha: quien emite/autoriza
  const xFirmaDerecha = ANCHO - MARGEN - 200;
  pagina.drawLine({
    start: { x: xFirmaDerecha, y: yFirmas },
    end: { x: xFirmaDerecha + 200, y: yFirmas },
    thickness: 0.75,
    color: negro,
  });
  pagina.drawText(datos.firmaEmisor.nombre.toUpperCase(), {
    x: xFirmaDerecha,
    y: yFirmas - 14,
    size: 10,
    font: fuenteNegrita,
    color: negro,
  });
  pagina.drawText(datos.firmaEmisor.cargo, {
    x: xFirmaDerecha,
    y: yFirmas - 26,
    size: 9,
    font: fuenteNormal,
    color: negro,
  });
  pagina.drawText(datos.firmaEmisor.unidad, {
    x: xFirmaDerecha,
    y: yFirmas - 37,
    size: 9,
    font: fuenteNormal,
    color: negro,
  });

  // Firma izquierda, más abajo: Secretaría General
  const yFirmaSecretaria = yFirmas - 55;
  const xFirmaIzquierda = MARGEN;
  pagina.drawLine({
    start: { x: xFirmaIzquierda, y: yFirmaSecretaria },
    end: { x: xFirmaIzquierda + 200, y: yFirmaSecretaria },
    thickness: 0.75,
    color: negro,
  });
  pagina.drawText(datos.firmaSecretaria.nombre.toUpperCase(), {
    x: xFirmaIzquierda,
    y: yFirmaSecretaria - 14,
    size: 10,
    font: fuenteNegrita,
    color: negro,
  });
  pagina.drawText(datos.firmaSecretaria.cargo, {
    x: xFirmaIzquierda,
    y: yFirmaSecretaria - 26,
    size: 9,
    font: fuenteNormal,
    color: negro,
  });

  y = yFirmaSecretaria - 50;

  // ---------- Distribución ----------
  pagina.drawText("Distribución:", {
    x: MARGEN,
    y,
    size: 7.5,
    font: fuenteNegrita,
    color: negro,
  });
  y -= 10;
  for (const linea of datos.distribucion) {
    pagina.drawText(linea, { x: MARGEN, y, size: 7.5, font: fuenteNormal, color: negro });
    y -= 9;
  }

  // ---------- Iniciales ----------
  y -= 2;
  pagina.drawText(
    `${datos.firmaSecretaria.iniciales}/${datos.inicialesTipeo}`,
    { x: MARGEN, y, size: 7, font: fuenteNormal, color: rgb(0.4, 0.4, 0.4) }
  );

  return pdf.save();
}
