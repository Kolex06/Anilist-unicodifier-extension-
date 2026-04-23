
(() => {
  const DEFAULTS = {
    mode: 'encode',
    exactStatusBoxOnly: true,
    notify: true
  };

  let settings = { ...DEFAULTS };
  let toast;
  let toastTimer;
  const processed = new WeakMap();

  function showToast(message) {
    if (!settings.notify) return;
    if (!document.documentElement) return;
    if (!toast) {
      toast = document.createElement('div');
      Object.assign(toast.style, {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        zIndex: '2147483647',
        background: 'rgba(17, 22, 29, 0.96)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: '12px',
        padding: '10px 14px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        lineHeight: '1.35',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        maxWidth: '360px'
      });
      document.documentElement.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toast) toast.style.display = 'none';
    }, 2600);
  }

  function encodeChar(char) {
    return `&#${char.codePointAt(0)};`;
  }

  function sanitizeText(text) {
    if (!text) return { text: text || '', changed: false, count: 0 };
    let changed = false;
    let count = 0;
    const out = Array.from(text).map((char) => {
      const cp = char.codePointAt(0);
      if (cp <= 0xFFFF) return char;
      changed = true;
      count += 1;
      return settings.mode === 'remove' ? '' : encodeChar(char);
    }).join('');
    return { text: out, changed, count };
  }

  function isTargetTextarea(el) {
    if (!(el instanceof HTMLTextAreaElement)) return false;
    if (!settings.exactStatusBoxOnly) return true;
    return el.matches('textarea.el-textarea__inner[placeholder="Write a status..."]');
  }

  function setNativeValue(el, value) {
    const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    if (desc && desc.set) desc.set.call(el, value);
    else el.value = value;
    if (el._valueTracker) el._valueTracker.setValue('');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function preserveCaret(el, oldValue, newValue) {
    const pos = el.selectionStart || 0;
    const beforeOld = oldValue.slice(0, pos);
    const beforeNew = sanitizeText(beforeOld).text;
    const newPos = Math.min(beforeNew.length, newValue.length);
    try { el.setSelectionRange(newPos, newPos); } catch {}
  }

  function sanitizeTextarea(el, reason = 'input') {
    if (!isTargetTextarea(el)) return false;
    const current = el.value || '';
    const lastValue = processed.get(el);
    if (lastValue === current && reason !== 'force') return false;
    const result = sanitizeText(current);
    processed.set(el, result.text);
    if (!result.changed) return false;
    setNativeValue(el, result.text);
    preserveCaret(el, current, result.text);
    const action = settings.mode === 'remove' ? 'removed' : 'encoded';
    showToast(`AniList Unicodifier ${action} ${result.count} unsupported character${result.count === 1 ? '' : 's'}.`);
    return true;
  }

  function bindTextarea(el) {
    if (!isTargetTextarea(el) || el.dataset.unicodifierBound === '1') return;
    el.dataset.unicodifierBound = '1';

    el.addEventListener('input', () => sanitizeTextarea(el, 'input'), true);
    el.addEventListener('paste', () => setTimeout(() => sanitizeTextarea(el, 'paste'), 0), true);
    el.addEventListener('blur', () => sanitizeTextarea(el, 'blur'), true);

    const form = el.closest('form');
    if (form && !form.dataset.unicodifierBound) {
      form.dataset.unicodifierBound = '1';
      form.addEventListener('submit', () => sanitizeTextarea(el, 'force'), true);
    }
  }

  function scan(root = document) {
    const list = root.querySelectorAll('textarea.el-textarea__inner, textarea');
    list.forEach(bindTextarea);
  }

  function hookGlobalClicks() {
    document.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('button') : null;
      if (!button) return;
      const box = document.querySelector('textarea.el-textarea__inner[placeholder="Write a status..."]');
      if (box) sanitizeTextarea(box, 'force');
    }, true);
  }

  async function init() {
    try {
      const stored = await chrome.storage.sync.get(DEFAULTS);
      settings = { ...DEFAULTS, ...stored };
    } catch {}

    hookGlobalClicks();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches && node.matches('textarea')) bindTextarea(node);
          if (node.querySelectorAll) scan(node);
        }
      }
    });

    if (document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => scan(), { once: true });
    } else {
      scan();
    }
  }

  init();
})();
