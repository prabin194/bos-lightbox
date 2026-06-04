import "@testing-library/jest-dom";

// jsdom does not implement HTMLDialogElement.showModal/close
// Polyfill them for tests that render the BosLightbox in modal mode.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
}
