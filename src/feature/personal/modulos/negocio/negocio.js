// src/feature/personal/modulos/negocio/negocio.js
// Controlador Frontend Autónomo del Módulo Ficha de Negocio & Especialista
// 100% JS Nativo · Cero TypeScript · Local-First · Integración con @widev y Firestore

import { Notificacion, wiSpin, wiAtajo, wiConfirmar, adrm, savels, getls, removels, Saludar } from '@widev';
import {
  obtenerDatosNegocio,
  guardarDatosNegocio,
  calcularAnosTrayectoria,
  sincronizarDesdeFirestore
} from './dataNegocio.js';
import { solicitarActualizacionWeb } from '../../../../actualizar.js';

export function inicializarNegocio() {
  const panelNegocio = document.getElementById('panel-negocio');
  if (!panelNegocio || panelNegocio.dataset.negocioInit === 'true') return;
  panelNegocio.dataset.negocioInit = 'true';

  const DRAFT_KEY = 'negocio_borrador_timestamp';
  let isSaving = false;
  let draftTimer = null;

  // Botón Principal Guardar
  const btnGuardarNegocio = document.getElementById('btnGuardarNegocio');
  const ngBadgeTrayectoria = document.getElementById('ngBadgeTrayectoria');
  const ngYearsText = document.getElementById('ngYearsText');
  const ngLangTabs = document.getElementById('ngLangTabs');

  // ── 1. SELECTOR DE PESTAÑAS DE IDIOMA (ES / EN) ──
  document.querySelectorAll('.ng-lang-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ng-lang-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.ng-lang-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPaneId = btn.getAttribute('data-target');
      const pane = document.getElementById(targetPaneId);
      if (pane) pane.classList.add('active');
    });
  });

  // ── 2. INPUTS DE IDENTIDAD Y MULTIMEDIA ──
  const inputEspecialista = document.getElementById('ngInputEspecialista');
  const inputColegiatura = document.getElementById('ngInputColegiatura');
  const inputTitulo = document.getElementById('ngInputTitulo');
  const inputGrado = document.getElementById('ngInputGrado');
  const inputLanzamiento = document.getElementById('ngInputLanzamiento');
  const inputLogo = document.getElementById('ngInputLogo');
  const inputLogoFull = document.getElementById('ngInputLogoFull');
  const inputImagenSede = document.getElementById('ngInputImagenSede');
  const imgLogoPreview = document.getElementById('ngImgLogoPreview');
  const imgLogoFullPreview = document.getElementById('ngImgLogoFullPreview');
  const imgHeroPreview = document.getElementById('ngImgHeroPreview');

  // Inputs Bilingües: Identidad (ES)
  const inputNombre = document.getElementById('ngInputNombre');
  const inputNombreCorto = document.getElementById('ngInputNombreCorto');
  const inputEnfoques = document.getElementById('ngInputEnfoques');
  const inputBioEs = document.getElementById('ngInputBioEs');

  // Inputs Bilingües: Identidad (EN)
  const inputNombreEn = document.getElementById('ngInputNombreEn');
  const inputNombreCortoEn = document.getElementById('ngInputNombreCortoEn');
  const inputEnfoquesEn = document.getElementById('ngInputEnfoquesEn');
  const inputBioEn = document.getElementById('ngInputBioEn');

  // ── 3. INPUTS DE CONTACTO Y HORARIOS ──
  const inputTelefono = document.getElementById('ngInputTelefono');
  const inputWhatsapp = document.getElementById('ngInputWhatsapp');
  const inputEmail = document.getElementById('ngInputEmail');
  const ngHorarioSemanaAbre = document.getElementById('ngHorarioSemanaAbre');
  const ngHorarioSemanaCierra = document.getElementById('ngHorarioSemanaCierra');
  const ngHorarioSabadoAbre = document.getElementById('ngHorarioSabadoAbre');
  const ngHorarioSabadoCierra = document.getElementById('ngHorarioSabadoCierra');

  const inputHorario = document.getElementById('ngInputHorario');
  const inputHorarioEn = document.getElementById('ngInputHorarioEn');
  const inputWhatsappMensaje = document.getElementById('ngInputWhatsappMensaje');
  const inputWhatsappMensajeEn = document.getElementById('ngInputWhatsappMensajeEn');
  const hintTelefonoFormato = document.getElementById('hintTelefonoFormato');
  const hintWhatsappFormato = document.getElementById('hintWhatsappFormato');
  const btnRestaurarMensajeWs = document.getElementById('btnRestaurarMensajeWs');

  // ── 4. INPUTS DE UBICACIÓN Y MAPS ──
  const inputDireccion = document.getElementById('ngInputDireccion');
  const inputReferencia = document.getElementById('ngInputReferencia');
  const inputDistrito = document.getElementById('ngInputDistrito');
  const inputCiudad = document.getElementById('ngInputCiudad');
  const inputMapsUrl = document.getElementById('ngInputMapsUrl');
  const inputLat = document.getElementById('ngInputLat');
  const inputLng = document.getElementById('ngInputLng');
  const btnBuscarGoogleMaps = document.getElementById('btnBuscarGoogleMaps');
  const btnProbarMapsUrl = document.getElementById('btnProbarMapsUrl');

  // ── 5. SEDES Y MODALIDADES BILINGÜES ──
  const ngSedeVesTagEs = document.getElementById('ngSedeVesTagEs');
  const ngSedeVesAtencionEs = document.getElementById('ngSedeVesAtencionEs');
  const ngSedeVesTagEn = document.getElementById('ngSedeVesTagEn');
  const ngSedeVesAtencionEn = document.getElementById('ngSedeVesAtencionEn');

  const ngSedeVirtualTagEs = document.getElementById('ngSedeVirtualTagEs');
  const ngSedeVirtualAtencionEs = document.getElementById('ngSedeVirtualAtencionEs');
  const ngSedeVirtualTagEn = document.getElementById('ngSedeVirtualTagEn');
  const ngSedeVirtualAtencionEn = document.getElementById('ngSedeVirtualAtencionEn');

  // ── 6. MÉTRICAS Y REDES SOCIALES ──
  const inputMetricaPacientes = document.getElementById('ngInputMetricaPacientes');
  const inputMetricaSatisfaccion = document.getElementById('ngInputMetricaSatisfaccion');
  const inputMetricaConfidencialidad = document.getElementById('ngInputMetricaConfidencialidad');
  const inputRedInstagram = document.getElementById('ngInputRedInstagram');
  const inputRedFacebook = document.getElementById('ngInputRedFacebook');
  const inputRedTiktok = document.getElementById('ngInputRedTiktok');
  const inputRedLinkedin = document.getElementById('ngInputRedLinkedin');

  // ── 7. SEO DINÁMICO BILINGÜE ──
  const inputSeoTituloEs = document.getElementById('ngInputSeoTituloEs');
  const inputSeoDescEs = document.getElementById('ngInputSeoDescEs');
  const inputSeoKeywordsEs = document.getElementById('ngInputSeoKeywordsEs');
  const inputSeoTituloEn = document.getElementById('ngInputSeoTituloEn');
  const inputSeoDescEn = document.getElementById('ngInputSeoDescEn');
  const inputSeoKeywordsEn = document.getElementById('ngInputSeoKeywordsEn');

  // ── GESTIÓN DE AÑOS DE TRAYECTORIA ──
  inputLanzamiento?.addEventListener('change', () => {
    const years = calcularAnosTrayectoria(inputLanzamiento.value);
    if (ngYearsText) ngYearsText.textContent = `${years} años`;
  });

  // ── ACTUALIZACIÓN DE PREVIEWS EN TIEMPO REAL ──
  inputImagenSede?.addEventListener('input', () => {
    const val = inputImagenSede.value.trim();
    if (imgHeroPreview) imgHeroPreview.src = val || '/imgwii/hero.webp';
  });

  inputLogo?.addEventListener('input', () => {
    const val = inputLogo.value.trim();
    if (imgLogoPreview) imgLogoPreview.src = val || '/imgwii/logo.webp';
  });

  inputLogoFull?.addEventListener('input', () => {
    const val = inputLogoFull.value.trim();
    if (imgLogoFullPreview) imgLogoFullPreview.src = val || '/imgwii/logo_full.webp';
  });

  // ── ASISTENTE DE GOOGLE MAPS ──
  btnBuscarGoogleMaps?.addEventListener('click', () => {
    const dir = inputDireccion?.value?.trim() || 'Jr. Dante 260 Surquillo Lima';
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir)}`, '_blank');
  });

  btnProbarMapsUrl?.addEventListener('click', () => {
    const url = inputMapsUrl?.value?.trim() || 'https://maps.google.com';
    window.open(url, '_blank');
  });

  // ── SALUDO DINÁMICO WHATSAPP ──
  btnRestaurarMensajeWs?.addEventListener('click', () => {
    const saludo = Saludar ? Saludar() : 'Hola';
    const esp = inputEspecialista?.value?.trim() || 'Lourdes';
    if (inputWhatsappMensaje) {
      inputWhatsappMensaje.value = `¡${saludo} ${esp}! Deseo orientación sobre mis trámites y declaraciones ante SUNAT.`;
      Notificacion('Mensaje restaurado', 'info', 1800);
    }
  });

  // ── CARGAR DATOS EN FORMULARIO ──
  function cargarFormulario(cfg) {
    if (!cfg) return;

    // Identidad Global
    if (inputEspecialista) inputEspecialista.value = cfg.identidad?.especialista || '';
    if (inputColegiatura) inputColegiatura.value = cfg.identidad?.colegiatura || '';
    if (inputTitulo) inputTitulo.value = cfg.identidad?.titulo || '';
    if (inputGrado) inputGrado.value = cfg.identidad?.grado || '';

    const fechaLanz = cfg.identidad?.lanzamientoFecha || '2020-03-15';
    if (inputLanzamiento) inputLanzamiento.value = fechaLanz;
    const years = calcularAnosTrayectoria(fechaLanz);
    if (ngYearsText) ngYearsText.textContent = `${years} años`;

    const foto = cfg.identidad?.imagenSede || '/imgwii/hero.webp';
    const logo = cfg.identidad?.logo || '/imgwii/logo.webp';
    const logoFull = cfg.identidad?.logoFull || '/imgwii/logo_full.webp';
    if (inputImagenSede) inputImagenSede.value = foto;
    if (inputLogo) inputLogo.value = logo;
    if (inputLogoFull) inputLogoFull.value = logoFull;
    if (imgHeroPreview) imgHeroPreview.src = foto;
    if (imgLogoPreview) imgLogoPreview.src = logo;
    if (imgLogoFullPreview) imgLogoFullPreview.src = logoFull;

    // Identidad (ES)
    if (inputNombre) inputNombre.value = cfg.identidad?.nombre || '';
    if (inputNombreCorto) inputNombreCorto.value = cfg.identidad?.nombreCorto || '';
    if (inputEnfoques) inputEnfoques.value = cfg.identidad?.enfoques || '';
    if (inputBioEs) {
      inputBioEs.value = typeof cfg.identidad?.bio === 'object' && cfg.identidad?.bio !== null
        ? (cfg.identidad.bio.es || '')
        : (cfg.identidad?.bio || '');
    }

    // Identidad (EN)
    if (inputNombreEn) inputNombreEn.value = cfg.identidad?.nombreEn || cfg.identidad?.nombre || '';
    if (inputNombreCortoEn) inputNombreCortoEn.value = cfg.identidad?.nombreCortoEn || cfg.identidad?.nombreCorto || '';
    if (inputEnfoquesEn) inputEnfoquesEn.value = cfg.identidad?.enfoquesEn || cfg.identidad?.enfoques || '';
    if (inputBioEn) {
      inputBioEn.value = typeof cfg.identidad?.bio === 'object' && cfg.identidad?.bio !== null
        ? (cfg.identidad.bio.en || '')
        : (cfg.identidad?.bioEn || '');
    }

    // Canales
    if (inputTelefono) inputTelefono.value = cfg.contacto?.telefono || '';
    if (inputWhatsapp) inputWhatsapp.value = cfg.contacto?.whatsapp || '';
    if (inputEmail) inputEmail.value = cfg.contacto?.email || '';

    if (ngHorarioSemanaAbre) ngHorarioSemanaAbre.value = cfg.horarios?.semana?.abre || '08:30';
    if (ngHorarioSemanaCierra) ngHorarioSemanaCierra.value = cfg.horarios?.semana?.cierra || '19:00';
    if (ngHorarioSabadoAbre) ngHorarioSabadoAbre.value = cfg.horarios?.sabado?.abre || '09:00';
    if (ngHorarioSabadoCierra) ngHorarioSabadoCierra.value = cfg.horarios?.sabado?.cierra || '13:00';

    // Horario Texto
    if (inputHorario) {
      inputHorario.value = typeof cfg.contacto?.horario === 'object' && cfg.contacto?.horario !== null
        ? (cfg.contacto.horario.es || '')
        : (cfg.contacto?.horario || '');
    }
    if (inputHorarioEn) {
      inputHorarioEn.value = typeof cfg.contacto?.horario === 'object' && cfg.contacto?.horario !== null
        ? (cfg.contacto.horario.en || '')
        : (cfg.contacto?.horarioEn || '');
    }

    // WhatsApp Mensaje (Sanitizado para evitar [object Object])
    const ws = cfg.contacto?.whatsappMensaje;
    if (inputWhatsappMensaje) {
      inputWhatsappMensaje.value = typeof ws === 'object' && ws !== null
        ? (ws.es || '')
        : (typeof ws === 'string' ? ws : '');
    }
    if (inputWhatsappMensajeEn) {
      inputWhatsappMensajeEn.value = typeof ws === 'object' && ws !== null
        ? (ws.en || '')
        : (cfg.contacto?.whatsappMensajeEn || '');
    }

    // Ubicación
    if (inputDireccion) inputDireccion.value = cfg.ubicacion?.direccion || '';
    if (inputReferencia) inputReferencia.value = cfg.ubicacion?.referencia || '';
    if (inputDistrito) inputDistrito.value = cfg.ubicacion?.distrito || 'Surquillo';
    if (inputCiudad) inputCiudad.value = cfg.ubicacion?.ciudad || 'Lima, PE';
    if (inputMapsUrl) inputMapsUrl.value = cfg.ubicacion?.mapsUrl || '';
    if (inputLat) inputLat.value = cfg.ubicacion?.coordenadas?.lat ?? -12.1125;
    if (inputLng) inputLng.value = cfg.ubicacion?.coordenadas?.lng ?? -77.0258;

    // Sedes
    const sedes = Array.isArray(cfg.sedes) ? cfg.sedes : [];
    const sedeSurquillo = sedes.find(s => s.id === 'surquillo') || sedes[0] || {};
    const sedeVirtual = sedes.find(s => s.id === 'virtual' || s.modalidad === 'Virtual') || sedes[1] || {};

    if (ngSedeVesTagEs) ngSedeVesTagEs.value = typeof sedeSurquillo.tag === 'object' ? (sedeSurquillo.tag?.es || '') : (sedeSurquillo.tag || 'Sede Surquillo');
    if (ngSedeVesAtencionEs) ngSedeVesAtencionEs.value = typeof sedeSurquillo.atencion === 'object' ? (sedeSurquillo.atencion?.es || '') : (sedeSurquillo.atencion || 'Lunes a Viernes (Previa Cita)');
    if (ngSedeVesTagEn) ngSedeVesTagEn.value = typeof sedeSurquillo.tag === 'object' ? (sedeSurquillo.tag?.en || '') : (sedeSurquillo.tagEn || 'Surquillo Office');
    if (ngSedeVesAtencionEn) ngSedeVesAtencionEn.value = typeof sedeSurquillo.atencion === 'object' ? (sedeSurquillo.atencion?.en || '') : (sedeSurquillo.atencionEn || 'Monday to Friday (By Appointment)');

    if (ngSedeVirtualTagEs) ngSedeVirtualTagEs.value = typeof sedeVirtual.tag === 'object' ? (sedeVirtual.tag?.es || '') : (sedeVirtual.tag || '100% Online');
    if (ngSedeVirtualAtencionEs) ngSedeVirtualAtencionEs.value = typeof sedeVirtual.atencion === 'object' ? (sedeVirtual.atencion?.es || '') : (sedeVirtual.atencion || 'Horarios Flexibles');
    if (ngSedeVirtualTagEn) ngSedeVirtualTagEn.value = typeof sedeVirtual.tag === 'object' ? (sedeVirtual.tag?.en || '') : (sedeVirtual.tagEn || '100% Online');
    if (ngSedeVirtualAtencionEn) ngSedeVirtualAtencionEn.value = typeof sedeVirtual.atencion === 'object' ? (sedeVirtual.atencion?.en || '') : (sedeVirtual.atencionEn || 'Flexible Schedule');

    // Métricas
    if (inputMetricaPacientes) inputMetricaPacientes.value = cfg.metricas?.pacientes || '450+';
    if (inputMetricaSatisfaccion) inputMetricaSatisfaccion.value = cfg.metricas?.satisfaccion || '98%';
    if (inputMetricaConfidencialidad) inputMetricaConfidencialidad.value = cfg.metricas?.confidencialidad || '100%';

    // Redes
    if (inputRedInstagram) inputRedInstagram.value = cfg.redes?.instagram || '';
    if (inputRedFacebook) inputRedFacebook.value = cfg.redes?.facebook || '';
    if (inputRedTiktok) inputRedTiktok.value = cfg.redes?.tiktok || '';
    if (inputRedLinkedin) inputRedLinkedin.value = cfg.redes?.linkedin || '';

    // SEO
    if (inputSeoTituloEs) inputSeoTituloEs.value = cfg.seo?.titulo?.es || '';
    if (inputSeoDescEs) inputSeoDescEs.value = cfg.seo?.descripcion?.es || '';
    if (inputSeoKeywordsEs) {
      const kw = cfg.seo?.keywords?.es;
      inputSeoKeywordsEs.value = Array.isArray(kw) ? kw.join(', ') : (kw || '');
    }

    if (inputSeoTituloEn) inputSeoTituloEn.value = cfg.seo?.titulo?.en || '';
    if (inputSeoDescEn) inputSeoDescEn.value = cfg.seo?.descripcion?.en || '';
    if (inputSeoKeywordsEn) {
      const kw = cfg.seo?.keywords?.en;
      inputSeoKeywordsEn.value = Array.isArray(kw) ? kw.join(', ') : (kw || '');
    }
  }

  // ── RECOLECTAR DATOS DE LA UI ──
  function recolectarDatos() {
    const kwEs = (inputSeoKeywordsEs?.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const kwEn = (inputSeoKeywordsEn?.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const rawTel = (inputTelefono?.value || '').trim();
    const telLimpio = rawTel.replace(/\D/g, '');

    return {
      id: 'principal',
      principal: true,
      moneda: 'PEN',
      idiomaDefecto: 'es',
      idiomasSoportados: ['es', 'en'],

      identidad: {
        nombre: inputNombre?.value?.trim() || "Lourdes Cusihuaman Gálvez",
        nombreCorto: inputNombreCorto?.value?.trim() || "Estudio Cusihuaman",
        especialista: inputEspecialista?.value?.trim() || "Lourdes Cusihuaman Gálvez",
        colegiatura: inputColegiatura?.value?.trim() || "",
        titulo: inputTitulo?.value?.trim() || "Asesora Contable y Tributaria",
        grado: inputGrado?.value?.trim() || "Ex-funcionaria de SUNAT · Universidad de Lima",
        enfoques: inputEnfoques?.value?.trim() || "Rentas de 4ta Categoría (RHE) • 5ta Categoría y Planillas • Regularización SUNAT",
        nombreEn: inputNombreEn?.value?.trim() || "Cusihuaman Accounting & Tax Firm",
        nombreCortoEn: inputNombreCortoEn?.value?.trim() || "Estudio Cusihuaman",
        enfoquesEn: inputEnfoquesEn?.value?.trim() || "4th Category Income (RHE) • 5th Category Payroll • SUNAT Tax Compliance",
        bio: {
          es: inputBioEs?.value?.trim() || "Especialista contable egresada de la Universidad de Lima y ex-orientadora de SUNAT con más de 12 años de trayectoria.",
          en: inputBioEn?.value?.trim() || "Tax and accounting specialist graduated from the University of Lima and former SUNAT officer with over 12 years of experience."
        },
        lanzamientoFecha: inputLanzamiento?.value || "2020-03-15",
        logo: inputLogo?.value?.trim() || "/imgwii/logo.webp",
        logoFull: inputLogoFull?.value?.trim() || "/imgwii/logo_full.webp",
        imagenSede: inputImagenSede?.value?.trim() || "/imgwii/hero.webp"
      },

      contacto: {
        telefono: rawTel || "+51 987 594 558",
        whatsapp: (inputWhatsapp?.value || '').trim().replace(/\D/g, '') || "51987594558",
        email: (inputEmail?.value || '').trim() || "contacto@contabilidadwii.com",
        whatsappMensaje: {
          es: inputWhatsappMensaje?.value?.trim() || "¡Hola Lourdes! Tengo dudas con mis declaraciones / trámites de SUNAT y deseo orientación.",
          en: inputWhatsappMensajeEn?.value?.trim() || "Hello Lourdes! I have questions regarding my taxes and fee receipts with SUNAT and would like guidance."
        },
        horario: {
          es: (inputHorario?.value || '').trim() || "Lunes a Viernes: 8:30 a.m. a 7:00 p.m. | Sábados: 9:00 a.m. a 1:00 p.m.",
          en: (inputHorarioEn?.value || '').trim() || "Monday to Friday: 8:30 a.m. to 7:00 p.m. | Saturdays: 9:00 a.m. to 1:00 p.m."
        }
      },

      horarios: {
        semana: {
          abre: ngHorarioSemanaAbre?.value || "08:30",
          cierra: ngHorarioSemanaCierra?.value || "19:00"
        },
        sabado: {
          abre: ngHorarioSabadoAbre?.value || "09:00",
          cierra: ngHorarioSabadoCierra?.value || "13:00"
        }
      },

      ubicacion: {
        direccion: inputDireccion?.value?.trim() || "Jr. Dante 260, Surquillo, Lima 15047",
        referencia: inputReferencia?.value?.trim() || "Atención presencial previa cita y 100% online nacional",
        distrito: inputDistrito?.value?.trim() || "Surquillo",
        ciudad: inputCiudad?.value?.trim() || "Lima",
        pais: "PE",
        codigoPostal: "15047",
        mapsUrl: inputMapsUrl?.value?.trim() || "https://maps.app.goo.gl/surquillo",
        coordenadas: {
          lat: parseFloat(inputLat?.value) || -12.1125,
          lng: parseFloat(inputLng?.value) || -77.0258
        }
      },

      sedes: [
        {
          id: "surquillo",
          nombre: "Sede Surquillo",
          distrito: "Surquillo",
          modalidad: "Presencial",
          direccion: inputDireccion?.value?.trim() || "Jr. Dante 260, Surquillo, Lima 15047",
          referencia: inputReferencia?.value?.trim() || "Cerca a Av. Angamos y Av. Paseo de la República",
          atencion: {
            es: ngSedeVesAtencionEs?.value?.trim() || "Lunes a Viernes (Previa Cita)",
            en: ngSedeVesAtencionEn?.value?.trim() || "Monday to Friday (By Appointment)"
          },
          tag: {
            es: ngSedeVesTagEs?.value?.trim() || "Sede Surquillo",
            en: ngSedeVesTagEn?.value?.trim() || "Surquillo Office"
          },
          mapsUrl: inputMapsUrl?.value?.trim() || "https://maps.app.goo.gl/surquillo",
          coordenadas: {
            lat: parseFloat(inputLat?.value) || -12.1125,
            lng: parseFloat(inputLng?.value) || -77.0258
          },
          activo: true
        },
        {
          id: "virtual",
          nombre: "Modalidad Online / Asesoría Virtual",
          distrito: "Online",
          modalidad: "Virtual",
          direccion: "Google Meet / Zoom (Nacional e Internacional)",
          referencia: "Sesiones en vivo 100% privadas y seguras",
          atencion: {
            es: ngSedeVirtualAtencionEs?.value?.trim() || "Horarios Flexibles",
            en: ngSedeVirtualAtencionEn?.value?.trim() || "Flexible Schedule"
          },
          tag: {
            es: ngSedeVirtualTagEs?.value?.trim() || "100% Online",
            en: ngSedeVirtualTagEn?.value?.trim() || "100% Online"
          },
          mapsUrl: "",
          coordenadas: { lat: 0, lng: 0 },
          activo: true
        }
      ],

      metricas: {
        pacientes: inputMetricaPacientes?.value?.trim() || "240+",
        satisfaccion: inputMetricaSatisfaccion?.value?.trim() || "98%",
        confidencialidad: inputMetricaConfidencialidad?.value?.trim() || "100%",
        years: calcularAnosTrayectoria(inputLanzamiento?.value)
      },

      redes: {
        instagram: inputRedInstagram?.value?.trim() || "",
        facebook: inputRedFacebook?.value?.trim() || "",
        tiktok: inputRedTiktok?.value?.trim() || "",
        linkedin: inputRedLinkedin?.value?.trim() || ""
      },

      seo: {
        titulo: {
          es: inputSeoTituloEs?.value?.trim() || "Estudio Cusihuaman | Lourdes Cusihuaman Gálvez - Asesoría Contable & SUNAT",
          en: inputSeoTituloEn?.value?.trim() || "Estudio Cusihuaman | Tax & Accounting Services in Peru (4th & 5th Category)"
        },
        descripcion: {
          es: inputSeoDescEs?.value?.trim() || "Asesoría tributaria especializada con Lourdes Cusihuaman Gálvez, ex-funcionaria de SUNAT. Rentas de 4ta y 5ta categoría, planillas PLAME y regularización.",
          en: inputSeoDescEn?.value?.trim() || "Expert tax consulting with Lourdes Cusihuaman, former SUNAT tax officer. 4th & 5th category tax filings and compliance."
        },
        keywords: {
          es: kwEs,
          en: kwEn
        },
        imagen: {
          url: "/imgwii/hero.webp",
          width: 1200,
          height: 630,
          type: "image/webp",
          alt: "Estudio Cusihuaman - CPC Lourdes Cusihuaman Gálvez en Surquillo y Asesoría Online",
          caption: "Asesoría contable, rentas de 4ta y 5ta categoría y regularización de inconsistencias SUNAT"
        },
        schema: {
          tipo: ["AccountingService", "ProfessionalService"],
          especialidades: ["TaxAccounting", "PayrollAccounting", "SUNATCompliance"],
          descripcionCorta: {
            es: "Estudio contable y asesoría tributaria en Surquillo y modalidad online a nivel nacional. Especializado en rentas de 4ta y 5ta categoría, planillas y regularización de deudas.",
            en: "Certified accounting and tax advisory firm in Surquillo and online nationwide. Specialized in personal taxes, payroll, and SUNAT compliance."
          }
        },
        audiencia: {
          es: ["profesionales independientes", "trabajadores en planilla", "mypes", "emprendedores"],
          en: ["freelancers", "remote workers", "expats", "business owners"]
        },
        intencion: {
          es: "agendar asesoria contable, declaracion anual 4ta categoria y regularizacion sunat",
          en: "book tax consultation and peru sunat tax filing"
        }
      }
    };
  }

  // ── 8. EVENTO GUARDAR EN BASE DE DATOS Y LOCALSTORAGE ──
  btnGuardarNegocio?.addEventListener('click', async () => {
    if (isSaving) return;
    isSaving = true;

    const spin = wiSpin ? wiSpin(btnGuardarNegocio) : null;
    btnGuardarNegocio.disabled = true;

    try {
      const payload = recolectarDatos();
      guardarDatosNegocio(payload);

      Notificacion('Ficha de estudio contable guardada con éxito en Firestore', 'success', 3000);

      // Ofrecer compilación/despliegue en la nube
      if (typeof solicitarActualizacionWeb === 'function') {
        setTimeout(() => {
          solicitarActualizacionWeb({
            modulo: 'negocio',
            titulo: 'Actualizar Web Pública',
            mensaje: '¿Deseas desplegar los cambios en el sitio web público ahora?'
          });
        }, 600);
      }
    } catch (err) {
      console.error(err);
      Notificacion('Error al guardar datos: ' + (err?.message || err), 'danger', 4000);
    } finally {
      btnGuardarNegocio.disabled = false;
      if (spin) spin.stop();
      isSaving = false;
    }
  });

  // Atajo de teclado universal Ctrl+S / Cmd+S
  wiAtajo?.('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    btnGuardarNegocio?.click();
  });

  // ── INICIALIZACIÓN CON DATOS OFICIALES ──
  const datosIniciales = obtenerDatosNegocio();
  cargarFormulario(datosIniciales);

  // Sincronización en segundo plano con Firestore
  sincronizarDesdeFirestore().then(fresco => {
    if (fresco) cargarFormulario(fresco);
  });
}

// Inicialización automática
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarNegocio);
} else {
  inicializarNegocio();
}

document.addEventListener('astro:page-load', inicializarNegocio);

