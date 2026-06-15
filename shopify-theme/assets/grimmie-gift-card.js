/*
 * Grimmie - gift card copy-to-clipboard
 * Vanilla custom element, no external libraries, no inline handlers.
 * Copies the gift card code, toggles the button label (Copia -> Copiato),
 * announces success via an aria-live region, and reverts after ~2s.
 */
class GrimmieCopy extends HTMLElement {
  connectedCallback() {
    this.button = this.querySelector('[data-copy-button]');
    this.labelEl = this.querySelector('[data-copy-label]');
    this.status = this.querySelector('[data-copy-status]');
    this.copyLabel = this.getAttribute('data-copy-label-text') || 'Copia';
    this.copiedLabel = this.getAttribute('data-copied-label-text') || 'Copiato';
    this.code = this.getAttribute('data-code') || '';
    this._timer = null;

    if (this.button) {
      this.button.addEventListener('click', this.handleClick.bind(this));
    }
  }

  handleClick() {
    this.copy(this.code).then((ok) => {
      if (ok) this.showCopied();
    });
  }

  async copy(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      /* fall through to legacy fallback */
    }
    return this.legacyCopy(text);
  }

  legacyCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  showCopied() {
    if (this.labelEl) this.labelEl.textContent = this.copiedLabel;
    if (this.status) this.status.textContent = this.copiedLabel;
    this.classList.add('is-copied');

    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      if (this.labelEl) this.labelEl.textContent = this.copyLabel;
      if (this.status) this.status.textContent = '';
      this.classList.remove('is-copied');
    }, 2000);
  }
}

if (!customElements.get('grimmie-copy')) {
  customElements.define('grimmie-copy', GrimmieCopy);
}
