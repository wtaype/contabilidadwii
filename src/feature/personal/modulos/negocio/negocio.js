// src/feature/personal/modulos/negocio/negocio.js
// Controlador Frontend Autónomo del Módulo Ficha de Negocio & Especialista
// 100% JS Nativo · Cero TypeScript · Local-First · Integración con @widev y Firestore

import { Notificacion, wiSpin, wiAtajo, wiConfirmar, wiSelect, adrm, savels, getls, removels, Saludar } from '@widev';
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
  const selectPais = document.getElementById('ngSelectPais');
  const hintPaisCodigo = document.getElementById('hintPaisCodigo');
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
  const inputRedYoutube = document.getElementById('ngInputRedYoutube');
  const inputRedFacebook = document.getElementById('ngInputRedFacebook');
  const inputRedInstagram = document.getElementById('ngInputRedInstagram');
  const inputRedTiktok = document.getElementById('ngInputRedTiktok');
  const inputRedCanalWhatsapp = document.getElementById('ngInputRedCanalWhatsapp');
  const inputRedWeb = document.getElementById('ngInputRedWeb');
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

  // ── GESTIÓN INTELIGENTE DE PAÍS, TELÉFONO Y WHATSAPP ──
  let instSelectPais = null;

  function soloDigitos(str = '') {
    return String(str || '').replace(/\D/g, '');
  }

  function getPaisCodeActual() {
    const opt = selectPais?.options[selectPais.selectedIndex];
    return opt?.dataset?.code || '51';
  }

  function formatearTelefonoVisible(numeroRaw, code = getPaisCodeActual()) {
    const raw = String(numeroRaw || '').trim();
    if (!raw) return '';
    let digitos = soloDigitos(raw);
    if (!digitos) return '';

    if (code && digitos.startsWith(code) && digitos.length > code.length) {
      digitos = digitos.slice(code.length);
    }

    if (code === '51' && digitos.length === 9) {
      return `+51 ${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
    }

    if (digitos.length >= 6) {
      const partes = digitos.match(/.{1,3}/g) || [digitos];
      return `+${code} ${partes.join(' ')}`;
    }

    return `+${code} ${digitos}`;
  }

  function generarWhatsappApi(numeroRaw, code = getPaisCodeActual()) {
    const raw = String(numeroRaw || '').trim();
    if (!raw) return '';
    let digitos = soloDigitos(raw);
    if (!digitos) return '';

    if (code && !digitos.startsWith(code)) {
      digitos = `${code}${digitos}`;
    }
    return digitos;
  }

  function sincronizarTelefonosDesdePais(code) {
    if (inputTelefono?.value) {
      inputTelefono.value = formatearTelefonoVisible(inputTelefono.value, code);
    }
    if (inputWhatsapp?.value) {
      inputWhatsapp.value = generarWhatsappApi(inputWhatsapp.value, code);
      if (hintWhatsappFormato) hintWhatsappFormato.textContent = inputWhatsapp.value;
    }
  }

  // Inicializar wiSelect para el País
  if (selectPais) {
    instSelectPais = wiSelect(selectPais, {
      placeholder: 'Selecciona país...',
      onChange: (val) => {
        const opt = selectPais.querySelector(`option[value="${val}"]`);
        const code = opt?.dataset.code || '51';
        if (hintPaisCodigo) hintPaisCodigo.textContent = `${opt?.text.slice(0, 2) || '🇵🇪'} +${code}`;
        sincronizarTelefonosDesdePais(code);
      }
    });
  }

  // Listener para Teléfono Visible: actualiza WhatsApp en vivo y formatea en blur
  inputTelefono?.addEventListener('input', () => {
    const code = getPaisCodeActual();
    const wsApi = generarWhatsappApi(inputTelefono.value, code);
    if (inputWhatsapp) {
      inputWhatsapp.value = wsApi;
    }
    if (hintWhatsappFormato) {
      hintWhatsappFormato.textContent = wsApi || '51987594558';
    }
  });

  inputTelefono?.addEventListener('blur', () => {
    const code = getPaisCodeActual();
    if (inputTelefono.value.trim()) {
      inputTelefono.value = formatearTelefonoVisible(inputTelefono.value, code);
    }
  });

  // Listener para WhatsApp API: limpia espacios de inmediato y sincroniza Teléfono
  inputWhatsapp?.addEventListener('input', () => {
    const limpio = soloDigitos(inputWhatsapp.value);
    inputWhatsapp.value = limpio;
    if (hintWhatsappFormato) {
      hintWhatsappFormato.textContent = limpio || '51987594558';
    }
    if (limpio && inputTelefono && !inputTelefono.value) {
      inputTelefono.value = formatearTelefonoVisible(limpio, getPaisCodeActual());
    }
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

  // ── SANITIZACIÓN Y GESTIÓN ERGONÓMICA DE REDES SOCIALES (SOLO USUARIO) ──
  function limpiarHandleRed(valor, tipo) {
    if (!valor) return '';
    let limpio = String(valor).trim();
    if (!limpio) return '';

    if (tipo === 'web') {
      return limpio
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/+$/, '');
    }

    if (tipo === 'whatsapp') {
      limpio = limpio
        .replace(/^https?:\/\/(www\.)?wa\.me\//i, '')
        .replace(/^https?:\/\/(www\.)?whatsapp\.com\/channel\//i, 'channel/')
        .replace(/^https?:\/\/(www\.)?chat\.whatsapp\.com\//i, 'chat/');
      return limpio;
    }

    // Remover protocolos y dominios si el usuario pega la URL completa
    limpio = limpio
      .replace(/^https?:\/\/(www\.)?youtube\.com\/(@|c\/|user\/)?/i, '')
      .replace(/^https?:\/\/(www\.)?youtu\.be\//i, '')
      .replace(/^https?:\/\/(www\.)?facebook\.com\//i, '')
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/^https?:\/\/(www\.)?tiktok\.com\/(@)?/i, '')
      .replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/|company\/)?/i, '');

    // Remover arrobas iniciales y slashes
    limpio = limpio.replace(/^@+/, '');
    limpio = limpio.replace(/^\/+|\/+$/g, '');

    return limpio;
  }

  function armarUrlRed(handle, tipo) {
    const user = limpiarHandleRed(handle, tipo);
    if (!user) return '';

    switch (tipo) {
      case 'youtube':
        return `https://youtube.com/@${user}`;
      case 'facebook':
        return `https://facebook.com/${user}`;
      case 'instagram':
        return `https://instagram.com/${user}`;
      case 'tiktok':
        return `https://tiktok.com/@${user}`;
      case 'linkedin':
        return `https://linkedin.com/in/${user}`;
      case 'web':
        return user.startsWith('http') ? user : `https://${user}`;
      case 'whatsapp':
        if (user.startsWith('http')) return user;
        if (user.startsWith('channel/') || user.startsWith('chat/')) {
          return `https://whatsapp.com/${user}`;
        }
        return `https://wa.me/${user.replace(/\D/g, '')}`;
      default:
        return user;
    }
  }

  // Sanitización automática al desenfocar o pegar
  const listaCamposRedes = [
    { el: inputRedYoutube, tipo: 'youtube' },
    { el: inputRedFacebook, tipo: 'facebook' },
    { el: inputRedInstagram, tipo: 'instagram' },
    { el: inputRedTiktok, tipo: 'tiktok' },
    { el: inputRedCanalWhatsapp, tipo: 'whatsapp' },
    { el: inputRedWeb, tipo: 'web' },
    { el: inputRedLinkedin, tipo: 'linkedin' }
  ];

  listaCamposRedes.forEach(({ el, tipo }) => {
    if (!el) return;
    const sanitizar = () => {
      const limpio = limpiarHandleRed(el.value, tipo);
      if (el.value !== limpio) {
        el.value = limpio;
      }
    };
    el.addEventListener('blur', sanitizar);
    el.addEventListener('paste', () => setTimeout(sanitizar, 20));
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
    const paisVal = cfg.contacto?.pais || cfg.ubicacion?.pais || 'PE';
    if (selectPais) {
      selectPais.value = paisVal;
      if (instSelectPais && typeof instSelectPais.setValue === 'function') {
        instSelectPais.setValue(paisVal);
      }
      const opt = selectPais.querySelector(`option[value="${paisVal}"]`);
      if (hintPaisCodigo) {
        hintPaisCodigo.textContent = `${opt?.text.slice(0, 2) || '🇵🇪'} +${opt?.dataset.code || '51'}`;
      }
    }

    if (inputTelefono) inputTelefono.value = cfg.contacto?.telefono || '';
    if (inputWhatsapp) {
      inputWhatsapp.value = soloDigitos(cfg.contacto?.whatsapp || '');
      if (hintWhatsappFormato) hintWhatsappFormato.textContent = inputWhatsapp.value || '51987594558';
    }
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
    if (inputMetricaPacientes) inputMetricaPacientes.value = cfg.metricas?.clientes || cfg.metricas?.pacientes || '+240';
    if (inputMetricaSatisfaccion) inputMetricaSatisfaccion.value = cfg.metricas?.satisfaccion || '99.4%';
    if (inputMetricaConfidencialidad) inputMetricaConfidencialidad.value = cfg.metricas?.confidencialidad || '100%';

    // Redes & Canales (Solo usuario/handle limpio para máxima sencillez)
    const r = cfg.redes || {};
    if (inputRedYoutube) {
      inputRedYoutube.value = r.youtubeUser || limpiarHandleRed(r.youtube, 'youtube') || '';
    }
    if (inputRedFacebook) {
      inputRedFacebook.value = r.facebookUser || limpiarHandleRed(r.facebook, 'facebook') || '';
    }
    if (inputRedInstagram) {
      inputRedInstagram.value = r.instagramUser || limpiarHandleRed(r.instagram, 'instagram') || '';
    }
    if (inputRedTiktok) {
      inputRedTiktok.value = r.tiktokUser || limpiarHandleRed(r.tiktok, 'tiktok') || '';
    }
    if (inputRedCanalWhatsapp) {
      inputRedCanalWhatsapp.value = r.canalWhatsappUser || limpiarHandleRed(r.canalWhatsapp || r.whatsapp, 'whatsapp') || '';
    }
    if (inputRedWeb) {
      inputRedWeb.value = r.webUser || limpiarHandleRed(r.web || r.webOficial, 'web') || '';
    }
    if (inputRedLinkedin) {
      inputRedLinkedin.value = r.linkedinUser || limpiarHandleRed(r.linkedin, 'linkedin') || '';
    }

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
    const actual = obtenerDatosNegocio();
    const paisSel = selectPais?.value || 'PE';
    const optPais = selectPais?.options[selectPais.selectedIndex];
    const paisCodeSel = optPais?.dataset?.code || '51';
    const rawTel = (inputTelefono?.value || '').trim();
    const rawWs = soloDigitos(inputWhatsapp?.value || '');

    return {
      id: 'principal',
      moneda: 'PEN',
      idiomaPrincipal: 'es',
      idiomas: ['es', 'en'],
      titulo: actual.titulo || "Estudio Contable Cusihuaman | CPC Lourdes Cusihuaman Gálvez",
      subtitulo: actual.subtitulo || "Contabilidad & Tributación • Lima - Perú",
      hero: actual.hero || {
        titulo: "Lourdes Cusihuaman Gálvez",
        subtitulo: "Contabilidad & Tributación • Lima - Perú",
        imagen: "/imgwii/hero.webp",
        alt: "Lourdes Cusihuaman Gálvez",
        precioHero: "80 soles",
        servicio: "Asesoría y Orientación Tributaria",
        descripcion: "Evalúo personalmente tu caso 100% online por videollamada o presencial previa cita en Surquillo. Te explico en sencillo qué hacer ante SUNAT sin enredos técnicos."
      },

      identidad: {
        nombre: inputNombre?.value?.trim() || actual.identidad?.nombre || "Lourdes Cusihuaman Gálvez",
        nombreCorto: inputNombreCorto?.value?.trim() || actual.identidad?.nombreCorto || "Estudio Cusihuaman",
        especialista: inputEspecialista?.value?.trim() || actual.identidad?.especialista || "Lourdes Cusihuaman Gálvez",
        colegiatura: inputColegiatura?.value?.trim() || "",
        cargo: inputTitulo?.value?.trim() || actual.identidad?.cargo || actual.identidad?.titulo || "Asesora Contable y Tributaria",
        titulo: inputTitulo?.value?.trim() || actual.identidad?.titulo || "Asesora Contable y Tributaria",
        grado: inputGrado?.value?.trim() || actual.identidad?.grado || "Ex-funcionaria de SUNAT · Universidad de Lima",
        enfoques: inputEnfoques?.value?.trim() || actual.identidad?.enfoques || "Rentas de 4ta Categoría (RHE) • 5ta Categoría y Planillas • Regularización SUNAT",
        nombreEn: inputNombreEn?.value?.trim() || actual.identidad?.nombreEn || "Cusihuaman Accounting & Tax Firm",
        nombreCortoEn: inputNombreCortoEn?.value?.trim() || actual.identidad?.nombreCortoEn || "Estudio Cusihuaman",
        enfoquesEn: inputEnfoquesEn?.value?.trim() || actual.identidad?.enfoquesEn || "4th Category Income (RHE) • 5th Category Payroll • SUNAT Tax Compliance",
        bio: {
          es: inputBioEs?.value?.trim() || actual.identidad?.bio?.es || "Soy especialista contable egresada de la Universidad de Lima y ex-orientadora de SUNAT con más de 12 años de trayectoria. Te brindo una asesoría cercana, clara y sin complicaciones.",
          en: inputBioEn?.value?.trim() || actual.identidad?.bio?.en || "I am a tax and accounting specialist graduated from the University of Lima and former SUNAT tax officer with over 12 years of experience."
        },
        lanzamientoFecha: inputLanzamiento?.value || actual.identidad?.lanzamientoFecha || "2020-03-15",
        logo: inputLogo?.value?.trim() || actual.identidad?.logo || "/imgwii/logo.webp",
        logoFull: inputLogoFull?.value?.trim() || actual.identidad?.logoFull || "/imgwii/logo_full.webp",
        imagenSede: inputImagenSede?.value?.trim() || actual.identidad?.imagenSede || "/imgwii/hero.webp"
      },

      contacto: {
        pais: paisSel,
        paisCode: paisCodeSel,
        telefono: rawTel || actual.contacto?.telefono || "",
        telefonoFijo: actual.contacto?.telefonoFijo || "(01) 447-6849",
        telefonoSecundario: "",
        whatsapp: rawWs || (rawTel ? `${paisCodeSel}${soloDigitos(rawTel)}` : (actual.contacto?.whatsapp || "")),
        email: (inputEmail?.value || '').trim() || actual.contacto?.email || "contacto@contabilidadwii.com",
        whatsappMensaje: {
          es: inputWhatsappMensaje?.value?.trim() || "¡Hola Lourdes! Deseo que evalúes mi caso tributario y me orientes con mis declaraciones ante SUNAT.",
          en: inputWhatsappMensajeEn?.value?.trim() || "Hello Lourdes! I would like you to review my tax situation and guide me through my SUNAT compliance."
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
        pais: paisSel,
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
        clientes: inputMetricaPacientes?.value?.trim() || "240+",
        pacientes: inputMetricaPacientes?.value?.trim() || "240+",
        satisfaccion: inputMetricaSatisfaccion?.value?.trim() || "99.4%",
        confidencialidad: inputMetricaConfidencialidad?.value?.trim() || "100%",
        years: calcularAnosTrayectoria(inputLanzamiento?.value)
      },

      redes: (() => {
        const ytUser = limpiarHandleRed(inputRedYoutube?.value, 'youtube');
        const fbUser = limpiarHandleRed(inputRedFacebook?.value, 'facebook');
        const igUser = limpiarHandleRed(inputRedInstagram?.value, 'instagram');
        const tkUser = limpiarHandleRed(inputRedTiktok?.value, 'tiktok');
        const wsCanalUser = limpiarHandleRed(inputRedCanalWhatsapp?.value, 'whatsapp');
        const wbUser = limpiarHandleRed(inputRedWeb?.value, 'web');
        const inUser = limpiarHandleRed(inputRedLinkedin?.value, 'linkedin');

        return {
          youtube: armarUrlRed(ytUser, 'youtube'),
          youtubeUser: ytUser,
          facebook: armarUrlRed(fbUser, 'facebook'),
          facebookUser: fbUser,
          instagram: armarUrlRed(igUser, 'instagram'),
          instagramUser: igUser,
          tiktok: armarUrlRed(tkUser, 'tiktok'),
          tiktokUser: tkUser,
          canalWhatsapp: armarUrlRed(wsCanalUser, 'whatsapp'),
          canalWhatsappUser: wsCanalUser,
          web: armarUrlRed(wbUser, 'web'),
          webUser: wbUser,
          linkedin: armarUrlRed(inUser, 'linkedin'),
          linkedinUser: inUser
        };
      })(),

      seo: {
        titulo: {
          es: inputSeoTituloEs?.value?.trim() || "Estudio Cusihuaman | CPC Lourdes Cusihuaman Gálvez - Asesoría Contable & SUNAT",
          en: inputSeoTituloEn?.value?.trim() || "Estudio Cusihuaman | Lourdes Cusihuaman - Tax & Accounting Firm Peru"
        },
        descripcion: {
          es: inputSeoDescEs?.value?.trim() || "Asesoría contable y tributaria estratégica con Lourdes Cusihuaman Gálvez, ex-orientadora de SUNAT. Especialista en 4ta categoría (RHE), 5ta categoría (planillas), regularización de Buzón SOL y devoluciones.",
          en: inputSeoDescEn?.value?.trim() || "Expert tax and accounting advisory in Lima & online with Lourdes Cusihuaman, former SUNAT officer. Specialized in 4th & 5th category taxes, payroll, and audit defense."
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
          alt: "Estudio Cusihuaman - CPC Lourdes Cusihuaman Gálvez, Asesoría Tributaria SUNAT",
          caption: "Asesoría contable y tributaria especializada ante SUNAT en Surquillo y modalidad online"
        },
        schema: {
          tipo: ["AccountingService", "FinancialService", "ProfessionalService"],
          especialidades: ["TaxPreparation", "PayrollServices", "TaxConsulting", "Bookkeeping", "SUNATCompliance"],
          descripcionCorta: {
            es: "Estudio de asesoría contable y tributaria en Surquillo y modalidad online a nivel nacional. Especializado en rentas de 4ta y 5ta categoría, planillas y fiscalización SUNAT.",
            en: "Accounting and tax advisory firm in Surquillo, Lima and online nationwide. Specialized in 4th/5th category income taxes and SUNAT compliance."
          }
        },
        audiencia: {
          es: ["profesionales independientes y freelancers con RHE (4ta categoría)", "trabajadores en planilla con retenciones en exceso (5ta categoría)", "pequeñas y medianas empresas (MYPEs) con personal en planilla", "personas naturales con negocio y emprendedores"],
          en: ["independent contractors and freelancers", "salaried workers seeking tax refunds", "small and medium enterprises with payroll", "business owners and entrepreneurs"]
        },
        intencion: {
          es: "asesoria tributaria sunat, declaracion renta 4ta categoria, suspension retenciones 1609, regularizacion buzon sol, planillas plame",
          en: "tax consulting peru, sunat tax compliance, 4th category tax return, payroll advisory"
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
      wiSpin(btnGuardarNegocio, false);
      if (spin && typeof spin.stop === 'function') spin.stop();
      isSaving = false;
    }
  });

  // Atajo Ctrl+S gestionado centralizadamente por el router universal de personal.js

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

