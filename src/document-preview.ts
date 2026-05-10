import { LitElement, html, nothing } from "lit";
import { property, state, query } from "lit/decorators.js";
import type { PreviewItem, DownloadEventDetail, ItemChangeEventDetail, ErrorEventDetail } from "./types";
import { styles } from "./styles";
import { renderImage, renderPdf, renderFallback, renderHeader, renderNavigation, renderFooter, renderInlineControls } from "./renderers";
import { getFocusableElements, trapFocus, setAriaHidden } from "./utils";

export class DocumentPreview extends LitElement {
  static styles = styles;

  /** Array of items to preview */
  @property({ type: Array }) items: PreviewItem[] = [];

  /** Whether the lightbox is open */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Index of the item to show when opened */
  @property({ type: Number, attribute: "initial-index" }) initialIndex = 0;

  /** Enable circular navigation (wrap from last to first) */
  @property({ type: Boolean }) loop = false;

  /** Close when clicking the overlay background */
  @property({ type: Boolean, attribute: "close-on-overlay" }) closeOnOverlay = true;

  /** Close when pressing Escape */
  @property({ type: Boolean, attribute: "close-on-escape" }) closeOnEscape = true;

  /** Show the download button */
  @property({ type: Boolean }) downloadable = true;

  /** Display mode: 'modal' for overlay, 'inline' for same-screen display */
  @property({ type: String, attribute: "display-mode" }) displayMode: "modal" | "inline" = "modal";

  @state() private _currentIndex = 0;
  @state() private _loaded = false;
  @state() private _imageError = false;
  @state() private _pdfError = false;
  @state() private _zoom = 1;
  @state() private _animClass = "open";

  @query(".container") private _container!: HTMLElement;

  private _prevFocus: HTMLElement | null = null;
  private _savedOverflow = "";
  private _touchStartX = 0;
  private _touchStartY = 0;

  private get _currentItem(): PreviewItem | undefined {
    return this.items[this._currentIndex];
  }

  private get _canGoPrev(): boolean {
    if (this.items.length <= 1) return false;
    if (this.loop) return true;
    return this._currentIndex > 0;
  }

  private get _canGoNext(): boolean {
    if (this.items.length <= 1) return false;
    if (this.loop) return true;
    return this._currentIndex < this.items.length - 1;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._currentIndex = Math.max(0, Math.min(this.initialIndex, this.items.length - 1));
  }

  updated(changed: Map<string, unknown>): void {
    if (changed.has("open")) {
      if (this.open) {
        this._currentIndex = Math.max(0, Math.min(this.initialIndex, this.items.length - 1));
        this._loaded = false;
        this._imageError = false;
        this._pdfError = false;
        this._zoom = 1;
        this._animClass = "open";
        this._prevFocus = document.activeElement as HTMLElement | null;
        this._savedOverflow = document.body.style.overflow;
        if (this.displayMode === "modal") {
          document.body.style.overflow = "hidden";
          setAriaHidden(true);
          this._trapFocus();
        }
        window.addEventListener("keydown", this._handleKeydown);
        this.dispatchEvent(new CustomEvent("open"));
      } else {
        if (this.displayMode === "modal") {
          document.body.style.overflow = this._savedOverflow;
          setAriaHidden(false);
          this._restoreFocus();
        }
        window.removeEventListener("keydown", this._handleKeydown);
        window.removeEventListener("keydown", this._handleFocusTrap);
      }
    }

    if (changed.has("_currentIndex") && this.open) {
      this._loaded = false;
      this._imageError = false;
      this._pdfError = false;
      this._zoom = 1;
      this.dispatchEvent(
        new CustomEvent<ItemChangeEventDetail>("item-change", {
          detail: {
            previousIndex: changed.get("_currentIndex") as number ?? this._currentIndex,
            currentIndex: this._currentIndex,
            item: this._currentItem!,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.body.style.overflow = this._savedOverflow || "";
    window.removeEventListener("keydown", this._handleKeydown);
    window.removeEventListener("keydown", this._handleFocusTrap);
  }

  private _handleFocusTrap = (event: KeyboardEvent): void => {
    const focusable = getFocusableElements(this._container);
    trapFocus(event, focusable);
  };

  private _trapFocus(): void {
    requestAnimationFrame(() => {
      const focusable = getFocusableElements(this._container);
      if (focusable.length > 0) {
        focusable[0]?.focus();
      }
      window.addEventListener("keydown", this._handleFocusTrap);
    });
  }

  private _restoreFocus(): void {
    if (this._prevFocus && typeof this._prevFocus.focus === "function") {
      this._prevFocus.focus();
    }
    this._prevFocus = null;
  }

  private _handleKeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) return;

    switch (event.key) {
      case "Escape":
        if (this.closeOnEscape) {
          event.preventDefault();
          this._close();
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        this._goNext();
        break;
      case "ArrowLeft":
        event.preventDefault();
        this._goPrevious();
        break;
    }
  };

  private _handleTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this._touchStartX = event.touches[0]?.clientX ?? 0;
      this._touchStartY = event.touches[0]?.clientY ?? 0;
    }
  }

  private _handleTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length > 0) {
      const dx = (event.changedTouches[0]?.clientX ?? 0) - this._touchStartX;
      const dy = (event.changedTouches[0]?.clientY ?? 0) - this._touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx > 0) this._goPrevious();
        else this._goNext();
      }
    }
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.items.length) return;
    this._currentIndex = index;
  }

  next(): void {
    this._goNext();
  }

  prev(): void {
    this._goPrevious();
  }

  openAt(index: number): void {
    this.initialIndex = index;
    this.open = true;
  }

  private _close(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _goNext(): void {
    if (this._canGoNext) {
      if (this._currentIndex < this.items.length - 1) {
        this._currentIndex++;
      } else if (this.loop) {
        this._currentIndex = 0;
      }
    }
  }

  private _goPrevious(): void {
    if (this._canGoPrev) {
      if (this._currentIndex > 0) {
        this._currentIndex--;
      } else if (this.loop) {
        this._currentIndex = this.items.length - 1;
      }
    }
  }

  private _handleOverlayClick(event: MouseEvent): void {
    if (this.displayMode === "modal" && this.closeOnOverlay && event.target === event.currentTarget) {
      this._close();
    }
  }

  private async _handleDownload(): Promise<void> {
    const item = this._currentItem;
    if (!item) return;

    this.dispatchEvent(
      new CustomEvent<DownloadEventDetail>("download", {
        detail: { item },
        bubbles: true,
        composed: true,
      })
    );

    try {
      const response = await fetch(item.url, { mode: "cors" });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement("a");
      a.href = item.url;
      a.download = item.name;
      a.click();
    }
  }

  private _handleImageLoad(): void {
    this._loaded = true;
    this._imageError = false;
  }

  private _handleImageError(): void {
    this._loaded = false;
    this._imageError = true;
    this.dispatchEvent(
      new CustomEvent<ErrorEventDetail>("error", {
        detail: { item: this._currentItem!, error: "Image failed to load" },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handlePdfError(): void {
    this._pdfError = true;
    this.dispatchEvent(
      new CustomEvent<ErrorEventDetail>("error", {
        detail: { item: this._currentItem!, error: "PDF failed to load" },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _zoomIn(): void {
    this._zoom = Math.min(this._zoom + 0.25, 5);
  }

  private _zoomOut(): void {
    this._zoom = Math.max(this._zoom - 0.25, 0.25);
  }

  private _resetZoom(): void {
    this._zoom = 1;
  }

  render() {
    if (!this.open) return nothing;

    const item = this._currentItem;
    if (!item) return nothing;

    return html`
      <div
        class="overlay ${this._animClass} ${this.displayMode}"
        @click=${this._handleOverlayClick}
        @touchstart=${this._handleTouchStart}
        @touchend=${this._handleTouchEnd}
        role="dialog"
        aria-modal=${this.displayMode === "modal" ? "true" : "false"}
        aria-label="Document preview"
      >
        <div class="container ${this._animClass}">
          ${this.displayMode === "inline" ? html`
            <!-- Full-page inline layout -->
            ${renderInlineControls(this.items, this._currentIndex)}
            ${renderHeader(this.displayMode, item, this.items, this._currentIndex, this._canGoPrev, this._canGoNext, this.downloadable, this._goPrevious, this._goNext, this._handleDownload, this._close)}
          ` : html`
            <!-- Modal layout -->
            ${renderHeader(this.displayMode, item, this.items, this._currentIndex, this._canGoPrev, this._canGoNext, this.downloadable, this._goPrevious, this._goNext, this._handleDownload, this._close)}
          `}

          <div class="content-area">
            ${this._renderContent(item)}
            ${renderNavigation(this.displayMode, this.items, this._canGoPrev, this._canGoNext, this._goPrevious, this._goNext)}
          </div>

          ${renderFooter(this.displayMode, item, this.items, this._currentIndex)}
        </div>
      </div>
    `;
  }

  private _renderContent(item: PreviewItem) {
    switch (item.type) {
      case "image":
        return renderImage(
          item, 
          this._loaded, 
          this._imageError, 
          this._zoom, 
          this.downloadable, 
          this._handleImageLoad, 
          this._handleImageError, 
          this._zoomIn, 
          this._zoomOut, 
          this._resetZoom, 
          this._handleDownload
        );
      case "pdf":
        return renderPdf(
          item, 
          this._pdfError, 
          this.downloadable, 
          this._handlePdfError, 
          this._handleDownload
        );
      case "other":
      default:
        return renderFallback(item, this.downloadable, this._handleDownload);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "document-preview": DocumentPreview;
  }
}
