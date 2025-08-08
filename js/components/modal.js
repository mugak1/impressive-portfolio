export class A11yModal {
  constructor(dialog) {
    this.dialog = dialog;
    this.closeBtn = dialog.querySelector('[data-close]');
    this.boundKeydown = this.onKeydown.bind(this);
    this.boundClick = this.onClick.bind(this);
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
  }
  open(contentEl) {
    const container = this.dialog.querySelector('.modal-content');
    container.innerHTML = '';
    container.appendChild(contentEl);
    this.dialog.showModal();
    document.addEventListener('keydown', this.boundKeydown);
    this.dialog.addEventListener('click', this.boundClick);
  }
  close() {
    this.dialog.close();
    document.removeEventListener('keydown', this.boundKeydown);
    this.dialog.removeEventListener('click', this.boundClick);
  }
  onKeydown(e) {
    if (e.key === 'Escape') this.close();
    if (e.key === 'Tab') {
      // simple focus trap
      const focusables = this.dialog.querySelectorAll('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }
  onClick(e) {
    // close when clicking backdrop
    const rect = this.dialog.getBoundingClientRect();
    const inDialog = rect.top <= e.clientY && e.clientY <= rect.bottom && rect.left <= e.clientX && e.clientX <= rect.right;
    if (!inDialog) this.close();
  }
}
