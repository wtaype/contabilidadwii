// src/core/widev/atajos.js
// atajos v1.0: Gestor global de atajos de teclado (Shortcuts) para la suite

export function wiAtajo(keys, callback) {
  if (typeof window === 'undefined') return;

  const keyCombos = String(keys)
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(Boolean);

  const handler = (e) => {
    const activeEl = document.activeElement;
    const isEditing = activeEl && (
      activeEl.tagName === 'INPUT' || 
      activeEl.tagName === 'TEXTAREA' || 
      activeEl.isContentEditable || 
      activeEl.contentEditable === 'true'
    );

    for (const combo of keyCombos) {
      const targetKeys = combo.split('+').map(k => k.trim());
      const ctrlPressed  = targetKeys.includes('ctrl') || targetKeys.includes('control');
      const shiftPressed = targetKeys.includes('shift');
      const altPressed   = targetKeys.includes('alt');
      const metaPressed  = targetKeys.includes('meta') || targetKeys.includes('cmd');

      const keyToken = targetKeys.find(k => !['ctrl', 'control', 'shift', 'alt', 'meta', 'cmd'].includes(k));
      if (!keyToken) continue;

      const isSaveShortcut = (ctrlPressed || metaPressed) && keyToken === 's';

      // Si está en un input y NO es un atajo de guardado (Ctrl+S), omitir
      if (isEditing && !isSaveShortcut) {
        continue;
      }

      const matchCtrl  = (ctrlPressed || metaPressed) ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey);
      const matchShift = shiftPressed === e.shiftKey;
      const matchAlt   = altPressed === e.altKey;
      const matchKey   = e.key.toLowerCase() === keyToken;

      if (matchCtrl && matchShift && matchAlt && matchKey) {
        e.preventDefault();
        callback(e);
        break;
      }
    }
  };

  window.addEventListener('keydown', handler);

  // Retornar función para desregistrar el atajo
  return () => window.removeEventListener('keydown', handler);
}
