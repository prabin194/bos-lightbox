import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { PreviewItem, DownloadEventDetail, ItemChangeEventDetail, ErrorEventDetail } from "./types";

/* ─── Types ─── */

export interface BosLightboxProps {
  items: PreviewItem[];
  open: boolean;
  initialIndex?: number;
  loop?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  downloadable?: boolean;
  displayMode?: "modal" | "inline";
  /** Custom render function for item content. Receives the current item and returns React nodes. */
  renderItem?: (item: PreviewItem) => React.ReactNode;
  /** Enable auto-playing slideshow mode. */
  slideshow?: boolean;
  /** Interval in ms between slideshow advances. Defaults to 3000. */
  slideshowInterval?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onItemChange?: (detail: ItemChangeEventDetail) => void;
  onDownload?: (detail: DownloadEventDetail) => void;
  onError?: (detail: ErrorEventDetail) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface BosLightboxRef {
  openAt: (index: number) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  close: () => void;
  getCurrentIndex: () => number;
  getCurrentItem: () => PreviewItem | undefined;
  /** Toggle slideshow play/pause. */
  toggleSlideshow: () => void;
  /** Whether the slideshow is currently active. */
  isSlideshowActive: () => boolean;
}

/* ─── Icons (inline SVGs) ─── */

const Icons = {
  close: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  prev: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  zoomIn: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  zoomOut: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
    </svg>
  ),
};

/* ─── Styles ─── */

const styles: Record<string, React.CSSProperties> = {
  dialogOverlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    maxWidth: "100vw",
    maxHeight: "100vh",
    padding: 0,
    margin: 0,
    border: "none",
    background: "transparent",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  inlineOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.92)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "#fff",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    maxWidth: "100vw",
    maxHeight: "100vh",
    background: "transparent",
    position: "relative",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    flexShrink: 0,
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  fileName: {
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "rgba(255,255,255,0.9)",
  },
  counter: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    fontWeight: 500,
    marginRight: 4,
  },
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    border: "none",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  navBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    border: "none",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    border: "none",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.15s, opacity 0.15s",
  },
  contentArea: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: 0,
  },
  spinnerWrap: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.2)",
    borderTopColor: "#fff",
    animation: "bos-spin 0.7s linear infinite",
  },
  zoomControls: {
    position: "absolute",
    bottom: 16,
    right: 16,
    display: "flex",
    gap: 6,
    zIndex: 10,
  },
  zoomBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    background: "rgba(0,0,0,0.3)",
    flexShrink: 0,
  },
  fallback: {
    textAlign: "center" as const,
    color: "rgba(255,255,255,0.6)",
  },
  inlineDots: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 0",
  },
};

/* ─── CSS keyframes (injected once) ─── */

const overlayKeyframes = `
@keyframes bos-overlay-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes bos-content-fade { from { opacity: 0.4; } to { opacity: 1; } }
@keyframes bos-spin { to { transform: rotate(360deg); } }
`;

/* ─── Helper: ImageViewer with drag-to-pan ─── */

function ImageViewer({
  url,
  name,
  zoom,
  onLoad,
  onError,
}: {
  url: string;
  name: string;
  zoom: number;
  onLoad: () => void;
  onError: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const panOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setLoaded(false);
    panOffset.current = { x: 0, y: 0 };
    if (imageWrapRef.current) {
      imageWrapRef.current.style.transform = `scale(1)`;
    }
  }, [url]);

  useEffect(() => {
    panOffset.current = { x: 0, y: 0 };
    if (imageWrapRef.current) {
      imageWrapRef.current.style.transform = `scale(${zoom})`;
      imageWrapRef.current.style.cursor = zoom > 1 ? "grab" : "default";
    }
  }, [zoom]);

  // Global mouse listeners for pan
  useEffect(() => {
    if (zoom <= 1) return;
    const el = imageWrapRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      panOffset.current = { x: dragStart.current.panX + dx, y: dragStart.current.panY + dy };
      el.style.transform = `translate(${panOffset.current.x}px, ${panOffset.current.y}px) scale(${zoom})`;
    };

    const handleUp = () => {
      isDragging.current = false;
      if (el) el.style.cursor = "grab";
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panOffset.current.x,
      panY: panOffset.current.y,
    };
    (e.currentTarget as HTMLElement).style.cursor = "grabbing";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", position: "relative" }}>
      {!loaded && (
        <div style={styles.spinnerWrap}>
          <div style={styles.spinner}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>Loading…</span></div>
        </div>
      )}
      <div
        ref={imageWrapRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "90vw",
          maxHeight: "85vh",
          cursor: zoom > 1 ? "grab" : "default",
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          transition: "transform 0.2s",
          userSelect: "none",
          touchAction: zoom > 1 ? "none" : "auto",
        }}
        onMouseDown={handleMouseDown}
      >
        <img
          src={url}
          alt={name}
          loading="lazy"
          draggable={false}
          onLoad={() => { setLoaded(true); onLoad(); }}
          onError={onError}
          style={{
            maxWidth: "90vw",
            maxHeight: "85vh",
            objectFit: "contain",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

const BosLightbox = forwardRef<BosLightboxRef, BosLightboxProps>((props, ref) => {
  const {
    items,
    open,
    initialIndex = 0,
    loop = false,
    closeOnOverlay = true,
    closeOnEscape = true,
    downloadable = true,
    displayMode = "modal",
    renderItem,
    slideshow = false,
    slideshowInterval = 3000,
    onOpen,
    onClose,
    onItemChange,
    onDownload,
    onError,
    className,
    style,
  } = props;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [pdfError, setPdfError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [playing, setPlaying] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const savedOverflowRef = useRef("");
  const prevIndexRef = useRef(currentIndex);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const goNextRef = useRef(goNext);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const currentItem = useMemo(() => items[currentIndex], [items, currentIndex]);

  const canGoPrev = useMemo(() => {
    if (items.length <= 1) return false;
    if (loop) return true;
    return currentIndex > 0;
  }, [items.length, loop, currentIndex]);

  const canGoNext = useMemo(() => {
    if (items.length <= 1) return false;
    if (loop) return true;
    return currentIndex < items.length - 1;
  }, [items.length, loop, currentIndex]);

  // ── SSR guard ──
  const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

  // Keep refs in sync
  goNextRef.current = goNext;

  // Sync currentIndex when items or open changes
  useEffect(() => {
    if (open) {
      const idx = Math.max(0, Math.min(initialIndex, items.length - 1));
      prevIndexRef.current = idx;
      setCurrentIndex(idx);
      setPdfError(false);
      setZoom(1);
    }
  }, [open, initialIndex, items.length]);

  // Dialog lifecycle
  useEffect(() => {
    if (!open || !isBrowser) return;

    prevFocusRef.current = document.activeElement as HTMLElement | null;
    savedOverflowRef.current = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    if (displayMode === "modal") {
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    }

    onOpen?.();

    return () => {
      document.body.style.overflow = savedOverflowRef.current || "";
      if (prevFocusRef.current && typeof prevFocusRef.current.focus === "function") {
        prevFocusRef.current.focus();
      }
    };
  }, [open, displayMode, isBrowser, onOpen]);

  // Keyboard events (arrows + Escape for inline mode)
  useEffect(() => {
    if (!open || !isBrowser) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "Escape":
          if (displayMode === "inline" && closeOnEscape) {
            e.preventDefault();
            onClose?.();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, isBrowser, canGoNext, canGoPrev, loop, items.length, currentIndex, displayMode, closeOnEscape, onClose]);

  // Native dialog events (cancel/close)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open || displayMode !== "modal") return;

    const onCancel = (e: Event) => {
      if (!closeOnEscape) e.preventDefault();
    };
    const onDialogClose = () => {
      if (open) onClose?.();
    };

    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onDialogClose);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onDialogClose);
    };
  }, [open, displayMode, closeOnEscape, onClose]);

  // Slideshow lifecycle
  useEffect(() => {
    if (!open || !slideshow) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    return () => {
      setPlaying(false);
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    };
  }, [open, slideshow]);

  // Slideshow interval
  useEffect(() => {
    if (!playing) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
      return;
    }
    if (!canGoNext) {
      setPlaying(false);
      return;
    }
    intervalRef.current = setInterval(() => {
      goNextRef.current(true);
    }, slideshowInterval);
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    };
  }, [playing, canGoNext, slideshowInterval]);

  // Item change events
  useEffect(() => {
    if (!open || !currentItem) return;
    onItemChange?.({
      previousIndex: prevIndexRef.current,
      currentIndex,
      item: currentItem,
    });
  }, [currentIndex, open, onItemChange, currentItem]);

  function goNext(isAuto = false) {
    if (!canGoNext) {
      if (playing) setPlaying(false);
      return;
    }
    setCurrentIdx((prev) => {
      if (prev < items.length - 1) return prev + 1;
      if (loop) return 0;
      return prev;
    }, isAuto);
    resetErrors();
  }

  function goPrev(isAuto = false) {
    if (!canGoPrev) return;
    setCurrentIdx((prev) => {
      if (prev > 0) return prev - 1;
      if (loop) return items.length - 1;
      return prev;
    }, isAuto);
    resetErrors();
  }

  function setCurrentIdx(fn: (prev: number) => number, isAuto = false) {
    const next = fn(currentIndex);
    if (next !== currentIndex) {
      prevIndexRef.current = currentIndex;
      setCurrentIndex(next);
      setZoom(1);
      if (!isAuto) setPlaying(false);
    }
  }

  function resetErrors() {
    setPdfError(false);
  }

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (!closeOnOverlay) return;
    if (displayMode === "modal" && e.target === dialogRef.current) {
      onClose?.();
    } else if (displayMode === "inline" && e.target === e.currentTarget) {
      onClose?.();
    }
  }, [displayMode, closeOnOverlay, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartX.current = e.touches[0]!.clientX;
      touchStartY.current = e.touches[0]!.clientY;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      const dx = e.changedTouches[0]!.clientX - touchStartX.current;
      const dy = e.changedTouches[0]!.clientY - touchStartY.current;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx > 0) goPrev();
        else goNext();
      }
    }
  }, [canGoNext, canGoPrev, loop, items.length, currentIndex]);

  const handleDownload = useCallback(async () => {
    if (!currentItem) return;
    onDownload?.({ item: currentItem });

    try {
      const response = await fetch(currentItem.url, { mode: "cors" });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = currentItem.name;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement("a");
      a.href = currentItem.url;
      a.download = currentItem.name;
      a.click();
    }
  }, [currentItem, onDownload]);

  // Imperative ref API
  useImperativeHandle(ref, () => ({
    openAt: (index: number) => {
      const idx = Math.max(0, Math.min(index, items.length - 1));
      prevIndexRef.current = currentIndex;
      setCurrentIndex(idx);
      setZoom(1);
      resetErrors();
      setPlaying(false);
    },
    goTo: (index: number) => {
      const idx = Math.max(0, Math.min(index, items.length - 1));
      prevIndexRef.current = currentIndex;
      setCurrentIndex(idx);
      setZoom(1);
      resetErrors();
      setPlaying(false);
    },
    next: () => goNext(),
    prev: () => goPrev(),
    close: () => {
      onClose?.();
    },
    getCurrentIndex: () => currentIndex,
    getCurrentItem: () => currentItem,
    toggleSlideshow: () => setPlaying((p) => !p),
    isSlideshowActive: () => playing,
  }), [currentIndex, currentItem, items.length, canGoNext, canGoPrev, loop, onClose, playing]);

  if (!open || !currentItem) return null;

  const renderVideo = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
      <video
        src={currentItem.url}
        controls
        autoPlay
        style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 8 }}
        onError={() => onError?.({ item: currentItem, error: "Video failed to load" })}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );

  const renderContent = () => {
    // If the user provides a custom renderer, use it
    if (renderItem) {
      return renderItem(currentItem);
    }

    switch (currentItem.type) {
      case "image":
        return (
          <>
            <ImageViewer
              url={currentItem.url}
              name={currentItem.name}
              zoom={zoom}
              onLoad={() => {}}
              onError={() => {
                onError?.({ item: currentItem, error: "Image failed to load" });
              }}
            />
            <div style={styles.zoomControls}>
              <button
                type="button"
                style={styles.zoomBtn}
                onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
                aria-label="Zoom in"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.4)"; }}
              >{Icons.zoomIn}</button>
              <button
                type="button"
                style={styles.zoomBtn}
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                aria-label="Zoom out"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.4)"; }}
              >{Icons.zoomOut}</button>
              {zoom !== 1 && (
                <button
                  type="button"
                  style={{ ...styles.zoomBtn, width: "auto", padding: "0 10px", fontSize: 12, fontWeight: 500 }}
                  onClick={() => setZoom(1)}
                  aria-label="Reset zoom"
                >Reset</button>
              )}
            </div>
          </>
        );
      case "video":
        return renderVideo();
      case "pdf":
        return pdfError ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            <p>Failed to load PDF. Try downloading the file instead.</p>
          </div>
        ) : (
          <iframe
            src={currentItem.url}
            title="PDF preview"
            style={{ width: "90vw", height: "85vh", border: "none", borderRadius: 8, background: "rgba(255,255,255,0.05)" }}
            onError={() => {
              setPdfError(true);
              onError?.({ item: currentItem, error: "PDF failed to load" });
            }}
          />
        );
      case "other":
      default:
        return (
          <div style={styles.fallback}>
            <div style={{ marginBottom: 12, opacity: 0.5 }}>{Icons.file}</div>
            <p style={{ fontSize: 14, margin: "0 0 4px" }}>Preview not available for this file type.</p>
            <p style={{ fontSize: 13, margin: 0, color: "rgba(255,255,255,0.4)" }}>{currentItem.name}</p>
          </div>
        );
    }
  };

  const header = (
    <div style={styles.header}>
      <div style={styles.headerLeft}>
        {displayMode === "inline" && (
          <>
            <button type="button" style={{ ...styles.navBtn, opacity: canGoPrev ? 1 : 0.3, cursor: canGoPrev ? "pointer" : "default" }} disabled={!canGoPrev} onClick={() => goPrev()} aria-label="Previous">{Icons.prev}</button>
            <button type="button" style={{ ...styles.navBtn, opacity: canGoNext ? 1 : 0.3, cursor: canGoNext ? "pointer" : "default" }} disabled={!canGoNext} onClick={() => goNext()} aria-label="Next">{Icons.next}</button>
          </>
        )}
        <span style={styles.fileName}>{currentItem.name}</span>
      </div>
      <div style={styles.headerRight}>
        {items.length > 1 && <span style={styles.counter}>{currentIndex + 1} / {items.length}</span>}
        {slideshow && items.length > 1 && (
          <button
            type="button"
            style={{
              ...styles.iconBtn,
              background: playing ? "rgba(76,175,80,0.25)" : "rgba(255,255,255,0.08)",
            }}
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = playing ? "rgba(76,175,80,0.35)" : "rgba(255,255,255,0.18)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = playing ? "rgba(76,175,80,0.25)" : "rgba(255,255,255,0.08)"; }}
          >{playing ? Icons.pause : Icons.play}</button>
        )}
        {downloadable && (
          <button type="button" style={styles.iconBtn} onClick={handleDownload} aria-label="Download"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
          >{Icons.download}</button>
        )}
        <button type="button" style={{ ...styles.iconBtn }} onClick={() => onClose?.()} aria-label="Close"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,60,60,0.3)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
        >{Icons.close}</button>
      </div>
    </div>
  );

  const footer = displayMode === "modal" && items.length > 1 ? (
    <div style={styles.footer}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{currentIndex + 1} of {items.length}</span>
    </div>
  ) : null;

  const content = (
    <div style={styles.contentArea}>
      <div key={currentIndex} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", animation: "bos-content-fade 0.15s ease" }}>
        {renderContent()}
      </div>
      {displayMode === "modal" && items.length > 1 && (
        <>
          <button
            type="button"
            style={{ ...styles.navArrow, left: 14, opacity: canGoPrev ? 1 : 0.25, cursor: canGoPrev ? "pointer" : "default" }}
            disabled={!canGoPrev}
            onClick={() => goPrev()}
            aria-label="Previous image"
            onMouseEnter={(e) => { if (canGoPrev) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
          >{Icons.prev}</button>
          <button
            type="button"
            style={{ ...styles.navArrow, right: 14, opacity: canGoNext ? 1 : 0.25, cursor: canGoNext ? "pointer" : "default" }}
            disabled={!canGoNext}
            onClick={() => goNext()}
            aria-label="Next image"
            onMouseEnter={(e) => { if (canGoNext) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
          >{Icons.next}</button>
        </>
      )}
    </div>
  );

  // Inline mode
  if (displayMode === "inline") {
    return (
      <div
        style={{ ...styles.inlineOverlay, ...style, animation: "bos-overlay-in 0.15s ease" }}
        className={className}
        onClick={handleOverlayClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Document preview"
      >
        <style>{overlayKeyframes}</style>
        <div style={styles.container}>
          <div style={styles.inlineDots}>
            {items.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: i === currentIndex ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                  transition: "background 0.2s",
                }}
                aria-label={`Item ${i + 1}`}
                role="tab"
                aria-selected={i === currentIndex}
              />
            ))}
          </div>
          {header}
          {content}
        </div>
      </div>
    );
  }

  // Modal mode — use native <dialog>
  return (
    <dialog
      ref={dialogRef}
      style={{ ...styles.dialogOverlay, ...style, animation: "bos-overlay-in 0.15s ease" }}
      className={className}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Document preview"
    >
      <style>{overlayKeyframes}</style>
      <div style={styles.container}>
        {header}
        {content}
        {footer}
      </div>
    </dialog>
  );
});

BosLightbox.displayName = "BosLightbox";

export { BosLightbox };
