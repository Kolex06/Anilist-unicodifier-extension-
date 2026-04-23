function encodeUnicode(str) {
  return str.replace(/[\u{10000}-\u{10FFFF}]/gu, (ch) => {
    return `&#${ch.codePointAt(0)};`;
  });
}

function updateTextareaValue(el, newValue) {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;

  if (nativeSetter) {
    nativeSetter.call(el, newValue);
  } else {
    el.value = newValue;
  }

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function attachToTextarea(el) {
  if (el.dataset.unicodifierAttached === "true") return;
  el.dataset.unicodifierAttached = "true";

  const process = () => {
    const val = el.value;
    const encoded = encodeUnicode(val);
    if (val !== encoded) {
      updateTextareaValue(el, encoded);
    }
  };

  el.addEventListener("blur", process);
  el.addEventListener("paste", () => setTimeout(process, 0));
}

function scan() {
  document.querySelectorAll("textarea").forEach(attachToTextarea);
}

const observer = new MutationObserver(scan);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

scan();