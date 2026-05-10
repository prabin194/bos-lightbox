import { html, nothing } from "lit";
import { ICONS } from "./icons";
import type { PreviewItem } from "./types";

export function renderImage(item: PreviewItem, loaded: boolean, imageError: boolean, zoom: number, downloadable: boolean, handleImageLoad: () => void, handleImageError: () => void, handleZoomIn: () => void, handleZoomOut: () => void, handleResetZoom: () => void, handleDownload: () => void) {
  const imgStyle = zoom !== 1
    ? `transform: scale(${zoom}); transform-origin: center center;`
    : '';

  return html`
    ${imageError ? html`
      <div class="error-message">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p>Failed to load image</p>
        ${downloadable ? html`
          <button type="button" class="download-btn" @click=${handleDownload} style="margin-top:12px">${ICONS.download} Download</button>
        ` : nothing}
      </div>
    ` : html`
      ${loaded ? nothing : html`<div class="spinner" aria-hidden="true"><span class="sr-only">Loading...</span></div>`}
      <img
        src=${item.url}
        alt=${item.name}
        class=${loaded && !imageError ? "" : "hidden"}
        style=${imgStyle}
        loading="lazy"
        @load=${handleImageLoad}
        @error=${handleImageError}
        draggable="false"
      />
      ${loaded && !imageError ? html`
        <div class="zoom-controls">
          <button type="button" class="zoom-btn" @click=${handleZoomOut} aria-label="Zoom out">${ICONS.zoomOut}</button>
          <span class="zoom-level">${Math.round(zoom * 100)}%</span>
          <button type="button" class="zoom-btn" @click=${handleZoomIn} aria-label="Zoom in">${ICONS.zoomIn}</button>
          ${zoom !== 1 ? html`
            <button type="button" class="zoom-btn" @click=${handleResetZoom} aria-label="Reset zoom" style="font-size:10px;padding:0 6px">1:1</button>
          ` : nothing}
        </div>
      ` : nothing}
    `}
  `;
}

export function renderPdf(item: PreviewItem, pdfError: boolean, downloadable: boolean, handlePdfError: () => void, handleDownload: () => void) {
  if (pdfError) {
    return html`
      <div class="error-message">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p>Failed to load PDF</p>
        ${downloadable ? html`
          <button type="button" class="download-btn" @click=${handleDownload} style="margin-top:12px">${ICONS.download} Download</button>
        ` : nothing}
      </div>
    `;
  }

  return html`
    <iframe
      src=${item.url}
      title=${item.name}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      referrerpolicy="no-referrer"
      @error=${handlePdfError}
      @load=${() => { const iframe = document.querySelector('iframe'); if (iframe) { try { const doc = iframe.contentDocument || iframe.contentWindow?.document; if (!doc || doc.body.innerHTML === '') handlePdfError(); } catch { /* cross-origin, assume ok */ } } }}
    ></iframe>
  `;
}

export function renderFallback(item: PreviewItem, downloadable: boolean, handleDownload: () => void) {
  return html`
    <div class="fallback">
      <div class="fallback-icon">${ICONS.file}</div>
      <h3 class="fallback-title">Preview Not Available</h3>
      <p class="fallback-desc">This file type cannot be previewed in the browser.</p>
      ${downloadable ? html`
        <button type="button" class="download-btn" @click=${handleDownload}>${ICONS.download} Download ${item.name}</button>
      ` : nothing}
    </div>
  `;
}

export function renderHeader(displayMode: "modal" | "inline", item: PreviewItem, items: PreviewItem[], currentIndex: number, canGoPrev: boolean, canGoNext: boolean, downloadable: boolean, goPrevious: () => void, goNext: () => void, handleDownload: () => void, close: () => void) {
  return displayMode === "inline" ? html`
    <div class="header">
      <span class="header-name" title=${item.name}>${item.name}</span>
      ${downloadable ? html`
        <button type="button" class="header-btn" @click=${handleDownload} aria-label="Download file">${ICONS.download}</button>
      ` : nothing}
      <button type="button" class="header-btn close-btn" @click=${close} aria-label="Close preview">${ICONS.close}</button>
    </div>
  ` : html`
    <div class="header">
      <span class="header-name" title=${item.name}>${item.name}</span>
      ${items.length > 1 ? html`
        <button type="button" class="header-btn" @click=${goPrevious} ?disabled=${!canGoPrev} aria-label="Previous document">${ICONS.prev}</button>
        <button type="button" class="header-btn" @click=${goNext} ?disabled=${!canGoNext} aria-label="Next document">${ICONS.next}</button>
        <span style="font-size:12px;color:#9ca3af;white-space:nowrap" aria-live="polite">${currentIndex + 1} / ${items.length}</span>
      ` : nothing}
      ${downloadable ? html`
        <button type="button" class="header-btn" @click=${handleDownload} aria-label="Download file">${ICONS.download}</button>
      ` : nothing}
      <button type="button" class="header-btn close-btn" @click=${close} aria-label="Close preview">${ICONS.close}</button>
    </div>
  `;
}

export function renderNavigation(displayMode: "modal" | "inline", items: PreviewItem[], canGoPrev: boolean, canGoNext: boolean, goPrevious: () => void, goNext: () => void) {
  return items.length > 1 ? html`
    ${displayMode === "inline" ? html`
      ${canGoPrev ? html`
        <button type="button" class="nav-btn nav-prev" @click=${goPrevious} aria-label="Previous document">${ICONS.prev}</button>
      ` : nothing}
      ${canGoNext ? html`
        <button type="button" class="nav-btn nav-next" @click=${goNext} aria-label="Next document">${ICONS.next}</button>
      ` : nothing}
    ` : html`
      ${canGoPrev ? html`
        <button type="button" class="nav-btn nav-prev" @click=${goPrevious} aria-label="Previous document">${ICONS.prev}</button>
      ` : nothing}
      ${canGoNext ? html`
        <button type="button" class="nav-btn nav-next" @click=${goNext} aria-label="Next document">${ICONS.next}</button>
      ` : nothing}
    `}
  ` : nothing;
}

export function renderFooter(displayMode: "modal" | "inline", item: PreviewItem, items: PreviewItem[], currentIndex: number) {
  return displayMode === "modal" && items.length > 1 ? html`
    <div class="footer">
      <span aria-live="polite">${item.name} — ${currentIndex + 1} of ${items.length}</span>
    </div>
  ` : nothing;
}

export function renderInlineControls(items: PreviewItem[], currentIndex: number) {
  return items.length > 1 ? html`
    <div class="counter">${currentIndex + 1} / ${items.length}</div>
    <div class="dots-indicator">
      ${items.map((_, index) => html`
        <div class="dot ${index === currentIndex ? 'active' : ''}"></div>
      `)}
    </div>
  ` : html`
    <div class="counter">1 / 1</div>
  `;
}
