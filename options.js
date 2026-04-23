
const DEFAULTS = { mode: 'encode', exactStatusBoxOnly: true, notify: true };
async function load() {
  const s = await chrome.storage.sync.get(DEFAULTS);
  document.querySelector(`input[name="mode"][value="${s.mode}"]`).checked = true;
  document.getElementById('exactStatusBoxOnly').checked = !!s.exactStatusBoxOnly;
  document.getElementById('notify').checked = !!s.notify;
}
document.getElementById('save').addEventListener('click', async () => {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const exactStatusBoxOnly = document.getElementById('exactStatusBoxOnly').checked;
  const notify = document.getElementById('notify').checked;
  await chrome.storage.sync.set({ mode, exactStatusBoxOnly, notify });
  const msg = document.getElementById('msg');
  msg.textContent = 'Saved.';
  setTimeout(() => msg.textContent = '', 1200);
});
load();
