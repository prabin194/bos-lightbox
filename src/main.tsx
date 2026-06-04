import { useState, useCallback, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BosLightbox } from "./BosLightbox";
import type { PreviewItem } from "./types";

/* ─── InView Hook ─── */

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, ...options },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  return { ref, inView };
}

/* ─── Demo Data ─── */

const ITEMS: PreviewItem[] = [
  { url: "https://picsum.photos/seed/doc1/800/600", type: "image", name: "Mountain Landscape" },
  { url: "https://picsum.photos/seed/doc2/800/600", type: "image", name: "City View" },
  { url: "https://picsum.photos/seed/doc3/800/600", type: "image", name: "Ocean Sunset" },
  { url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", type: "pdf", name: "Sample PDF Document" },
  { url: "#", type: "other", name: "sample-file.zip" },
];

const PLAYGROUND_ITEMS: PreviewItem[] = [
  { url: "https://picsum.photos/seed/pg1/800/600", type: "image", name: "Sunrise" },
  { url: "https://picsum.photos/seed/pg2/800/600", type: "image", name: "Forest" },
];

/* ─── Icons ─── */

const Icons = {
  file: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  pdf: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  github: () => (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
  ),
  star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
  ),
};

/* ─── Props Playground Component ─── */

type DisplayMode = "modal" | "inline";

function PropsPlayground() {
  const [pgOpen, setPgOpen] = useState(false);
  const [pgDisplayMode, setPgDisplayMode] = useState<DisplayMode>("modal");
  const [pgLoop, setPgLoop] = useState(false);
  const [pgCloseOnOverlay, setPgCloseOnOverlay] = useState(true);
  const [pgCloseOnEscape, setPgCloseOnEscape] = useState(true);
  const [pgDownloadable, setPgDownloadable] = useState(true);
  const [pgInitialIndex, setPgInitialIndex] = useState(0);
  const [pgCodeCopied, setPgCodeCopied] = useState(false);

  useEffect(() => {
    if (pgCodeCopied) {
      const t = setTimeout(() => setPgCodeCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [pgCodeCopied]);

  const generateCode = useCallback(() => {
    const lines: string[] = [
      `<BosLightbox`,
      `  items={items}`,
      `  open={open}`,
    ];
    if (pgInitialIndex > 0) lines.push(`  initialIndex={${pgInitialIndex}}`);
    if (pgLoop) lines.push(`  loop`);
    if (!pgCloseOnOverlay) lines.push(`  closeOnOverlay={false}`);
    if (!pgCloseOnEscape) lines.push(`  closeOnEscape={false}`);
    if (!pgDownloadable) lines.push(`  downloadable={false}`);
    if (pgDisplayMode !== "modal") lines.push(`  displayMode="${pgDisplayMode}"`);
    lines.push(`  onClose={() => setOpen(false)}`);
    lines.push(`/>`);
    return lines.join("\n");
  }, [pgDisplayMode, pgLoop, pgCloseOnOverlay, pgCloseOnEscape, pgDownloadable, pgInitialIndex]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateCode());
      setPgCodeCopied(true);
    } catch { /* noop */ }
  }, [generateCode]);

  return (
    <div className="playground">
      <div className="playground-controls">
        <div className="playground-controls-inner">
          <h3 className="playground-panel-title">Props</h3>

          <div className="pg-field">
            <label className="pg-label">
              <span className="pg-label-text">displayMode</span>
              <select
                className="pg-select"
                value={pgDisplayMode}
                onChange={(e) => setPgDisplayMode(e.target.value as DisplayMode)}
              >
                <option value="modal">"modal"</option>
                <option value="inline">"inline"</option>
              </select>
            </label>
          </div>

          <div className="pg-field">
            <label className="pg-toggle">
              <span className="pg-label-text">loop</span>
              <input type="checkbox" checked={pgLoop} onChange={(e) => setPgLoop(e.target.checked)} />
              <span className="pg-toggle-track"><span className="pg-toggle-thumb" /></span>
            </label>
          </div>

          <div className="pg-field">
            <label className="pg-toggle">
              <span className="pg-label-text">closeOnOverlay</span>
              <input type="checkbox" checked={pgCloseOnOverlay} onChange={(e) => setPgCloseOnOverlay(e.target.checked)} />
              <span className="pg-toggle-track"><span className="pg-toggle-thumb" /></span>
            </label>
          </div>

          <div className="pg-field">
            <label className="pg-toggle">
              <span className="pg-label-text">closeOnEscape</span>
              <input type="checkbox" checked={pgCloseOnEscape} onChange={(e) => setPgCloseOnEscape(e.target.checked)} />
              <span className="pg-toggle-track"><span className="pg-toggle-thumb" /></span>
            </label>
          </div>

          <div className="pg-field">
            <label className="pg-toggle">
              <span className="pg-label-text">downloadable</span>
              <input type="checkbox" checked={pgDownloadable} onChange={(e) => setPgDownloadable(e.target.checked)} />
              <span className="pg-toggle-track"><span className="pg-toggle-thumb" /></span>
            </label>
          </div>

          <div className="pg-field">
            <label className="pg-label">
              <span className="pg-label-text">initialIndex</span>
              <input
                type="number"
                className="pg-number"
                min={0}
                max={1}
                value={pgInitialIndex}
                onChange={(e) => setPgInitialIndex(Math.min(1, Math.max(0, parseInt(e.target.value) || 0)))}
              />
            </label>
          </div>

          <button className="pg-open-btn" onClick={() => setPgOpen(true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Open Lightbox
          </button>

          <p className="pg-hint">
            {pgDisplayMode === "modal"
              ? "Modal uses native &lt;dialog&gt; with focus trap"
              : "Inline renders as a full-page overlay"}
          </p>
        </div>
      </div>

      <div className="playground-preview">
        <div className="playground-preview-area">
          <div className="playground-preview-placeholder">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 12 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <p>Configure props &amp; click "Open Lightbox"</p>
          </div>
        </div>

        <BosLightbox
          items={PLAYGROUND_ITEMS}
          open={pgOpen}
          initialIndex={pgInitialIndex}
          loop={pgLoop}
          closeOnOverlay={pgCloseOnOverlay}
          closeOnEscape={pgCloseOnEscape}
          downloadable={pgDownloadable}
          displayMode={pgDisplayMode}
          onClose={() => setPgOpen(false)}
        />

        <div className="playground-code">
          <div className="pg-code-header">
            <span>Generated JSX</span>
            <button className="pg-copy-btn" onClick={handleCopyCode}>
              {pgCodeCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="pg-code-pre">{generateCode()}</pre>
        </div>
      </div>
    </div>
  );
}

/* ─── Code Examples Component ─── */

const EXAMPLES = [
  {
    id: "basic",
    label: "Basic",
    code: `import { useState } from "react";
import { BosLightbox } from "bos-lightbox";

function Gallery() {
  const [open, setOpen] = useState(false);

  const items = [
    { url: "photo.jpg", type: "image", name: "Photo" },
    { url: "doc.pdf",   type: "pdf",   name: "Report" },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Open Gallery
      </button>
      <BosLightbox
        items={items}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}`,
  },
  {
    id: "ref",
    label: "With Ref",
    code: `import { useRef, useState } from "react";
import { BosLightbox } from "bos-lightbox";
import type { BosLightboxRef } from "bos-lightbox";

function Gallery() {
  const ref = useRef<BosLightboxRef>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <BosLightbox
        ref={ref}
        items={items}
        open={open}
        onClose={() => setOpen(false)}
      />
      <button onClick={() => ref.current?.openAt(1)}>
        Open Second Item
      </button>
      <button onClick={() => ref.current?.next()}>
        Next
      </button>
      <button onClick={() => ref.current?.prev()}>
        Previous
      </button>
    </>
  );
}`,
  },
  {
    id: "events",
    label: "Events",
    code: `import { useState } from "react";
import { BosLightbox } from "bos-lightbox";

function TrackedGallery() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BosLightbox
        items={items}
        open={open}
        onOpen={() => console.log("opened")}
        onClose={() => setOpen(false)}
        onItemChange={({ previousIndex, currentIndex }) =>
          console.log(\`\${previousIndex} → \${currentIndex}\`)}
        onDownload={({ item }) =>
          console.log("Downloading:", item.name)}
        onError={({ item, error }) =>
          console.error(item.name, error)}
      />
      <button onClick={() => setOpen(true)}>Open</button>
    </>
  );
}`,
  },
  {
    id: "types",
    label: "Types",
    code: `import type { PreviewItem } from "bos-lightbox";

interface PreviewItem {
  type: "image" | "pdf" | "other";
  url: string;
  name: string;
}

// Ref methods available via useRef<BosLightboxRef>
interface BosLightboxRef {
  openAt(index: number): void;
  goTo(index: number): void;
  next(): void;
  prev(): void;
  close(): void;
  getCurrentIndex(): number;
  getCurrentItem(): PreviewItem | undefined;
}`,
  },
  {
    id: "inline",
    label: "Inline Mode",
    code: `import { useState } from "react";
import { BosLightbox } from "bos-lightbox";

function FullPageGallery() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Open Full-Page Preview
      </button>

      {/* Renders as overlay without <dialog> */}
      <BosLightbox
        items={items}
        open={open}
        displayMode="inline"
        onClose={() => setOpen(false)}
      />
    </>
  );
}`,
  },
];

function CodeExamples() {
  const [active, setActive] = useState(0);

  return (
    <div className="examples-wrap">
      <div className="examples-tabs">
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex.id}
            className={`examples-tab ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            {ex.label}
          </button>
        ))}
      </div>
      <div className="code-block">
        <div className="code-header">
          <div className="dots"><span /><span /><span /></div>
          <span>{EXAMPLES[active].label} Usage</span>
        </div>
        <pre className="examples-code">{EXAMPLES[active].code}</pre>
      </div>
    </div>
  );
}

/* ─── Feature Demo Card ─── */

type DemoFeature = {
  icon: string;
  title: string;
  desc: string;
  demoLabel: string;
};

function FeatureDemoCard({ feature, onPlay }: { feature: DemoFeature; onPlay: () => void }) {
  return (
    <div className="demo-card">        <div className="demo-card-preview">
          <div className={`demo-anim-${feature.title.toLowerCase().replace(/\s+/g, "-")}`} />
            <button className="demo-card-play" onClick={onPlay} aria-label={`Demo ${feature.title}`}>
          <Icons.play />
        </button>
      </div>
      <div className="demo-card-body">
        <span className="demo-card-icon">{feature.icon}</span>
        <h3 className="demo-card-title">{feature.title}</h3>
        <p className="demo-card-desc">{feature.desc}</p>
      </div>
    </div>
  );
}

/* ─── App Component ─── */

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [eventLogging, setEventLogging] = useState(false);
  const [eventLog, setEventLog] = useState<{ time: string; message: string }[]>([]);
  const [openIndex, setOpenIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const eventLogRef = useRef<HTMLDivElement>(null);

  const { ref: gallerySectionRef, inView: gallerySectionInView } = useInView();
  const { ref: playgroundSectionRef, inView: playgroundSectionInView } = useInView();
  const { ref: examplesSectionRef, inView: examplesSectionInView } = useInView();
  const { ref: apiSectionRef, inView: apiSectionInView } = useInView();
  const { ref: featuresSectionRef, inView: featuresSectionInView } = useInView();
  const { ref: showcaseSectionRef, inView: showcaseSectionInView } = useInView();
  const { ref: metricsRef, inView: metricsInView } = useInView();

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const logEvent = useCallback(
    (msg: string) => {
      if (!eventLogging) return;
      const time = new Date().toLocaleTimeString();
      setEventLog((prev) => [...prev, { time, message: msg }]);
      requestAnimationFrame(() => {
        const el = eventLogRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    [eventLogging],
  );

  const openModal = useCallback((index: number) => {
    setOpenIndex(index);
    setModalOpen(true);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("npm install bos-lightbox");
      setCopied(true);
    } catch { /* fallback */ }
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    logEvent("close — lightbox closed");
  }, [logEvent]);

  const handleModalOpen = useCallback(() => {
    logEvent("open — lightbox opened");
  }, [logEvent]);

  const handleItemChange = useCallback(
    (detail: { previousIndex: number; currentIndex: number; item: PreviewItem }) => {
      logEvent(`item-change — ${detail.currentIndex + 1} / ${ITEMS.length}`);
    },
    [logEvent],
  );

  const handleDownload = useCallback(
    (detail: { item: PreviewItem }) => {
      logEvent(`download — ${detail.item.name}`);
    },
    [logEvent],
  );

  const handleError = useCallback(
    (detail: { item: PreviewItem; error: string }) => {
      logEvent(`error — ${detail.item.name}: ${detail.error}`);
    },
    [logEvent],
  );

  const handlePlayDemo = useCallback(() => {
    openModal(0);
  }, [openModal]);

  const FEATURES: DemoFeature[] = [
    { icon: "🖼️", title: "Image Zoom", desc: "Zoom in/out with smooth transforms and a reset button. Supports any browser-renderable image format.", demoLabel: "Play demo" },
    { icon: "📄", title: "PDF Preview", desc: "Native PDF viewer integration via iframe for seamless document previews inside the lightbox.", demoLabel: "Play demo" },
    { icon: "⌨️", title: "Keyboard Nav", desc: "Arrow keys for navigation, Escape to close. Full focus management with the native &lt;dialog&gt; element.", demoLabel: "Play demo" },
    { icon: "📱", title: "Touch Gestures", desc: "Swipe left/right to navigate between items on mobile devices and touch-enabled screens.", demoLabel: "Play demo" },
  ];

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="badge">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          React 18+ Component
        </div>
        <h1>
          Images, PDFs &amp; more.<br />
          <span className="highlight">One lightbox.</span>
        </h1>
        <p>
          A polished React lightbox component for previewing images, PDFs, and other documents
          with keyboard navigation, zoom controls, touch gestures, and a native modal dialog.
        </p>
        <div className="install-block">
          <span className="prompt">$</span>
          <span className="command">
            <span className="command-text">npm install bos-lightbox</span>
          </span>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <a
          className="github-stars"
          href="https://github.com/prabin194/bos-lightbox"
          target="_blank" rel="noopener"
        >
          <Icons.github />
          <Icons.star />
          View on GitHub
        </a>
      </section>

      {/* ─── Metrics ─── */}
      <div className="container">
        <div className={`reveal-section ${metricsInView ? "visible" : ""}`} ref={metricsRef}>
          <div className="metrics">
            <div className="metric-card">
              <div className="value" style={{ color: "var(--accent)" }}>5</div>
              <div className="label">File types supported</div>
            </div>
            <div className="metric-card">
              <div className="value" style={{ color: "var(--success)" }}>2</div>
              <div className="label">Display modes</div>
            </div>
            <div className="metric-card">
              <div className="value" style={{ color: "var(--warning)" }}>2.3k</div>
              <div className="label">Bundle size (gzip)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Gallery ─── */}
      <div className="container">
        <section ref={gallerySectionRef} className={`reveal-section ${gallerySectionInView ? "visible" : ""}`}>
          <div className="section-header">
            <h2>Gallery Preview</h2>
            <p>Click any card to open the lightbox in modal mode. Use <kbd>←</kbd> <kbd>→</kbd> to navigate, <kbd>Esc</kbd> to close.</p>
          </div>

          <div className="gallery-grid">
            {ITEMS.map((item, index) => (
              <div
                key={index}
                className={`gallery-card ${gallerySectionInView ? "stagger-card" : ""}`}
                style={gallerySectionInView ? { animationDelay: `${index * 80}ms` } : undefined}
                tabIndex={0} role="button"
                aria-label={`Preview ${item.name}`}
                onClick={() => openModal(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(index); }
                }}
              >
                <div className="icon-wrap">
                  {item.type === "image" ? <Icons.image /> : item.type === "pdf" ? <Icons.pdf /> : <Icons.file />}
                </div>
                <div className="name">{item.name}</div>
                <span className={`type-badge type-${item.type}`}>{item.type}</span>
              </div>
            ))}
          </div>

          <div className="demo-controls">
            <button className="primary" onClick={() => openModal(0)}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Open First Item
            </button>
            <button onClick={() => setEventLogging((v) => !v)}>
              {eventLogging ? "⏹ Stop Logging" : "⏱ Enable Logging"}
            </button>
          </div>

          <div className="event-log-wrap">
            <div className="event-log-header">
              <span>Event Log</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className={eventLogging ? "dot" : ""} style={{ opacity: eventLogging ? 1 : 0.3 }} />
                {eventLogging ? "Recording" : "Idle"}
              </span>
            </div>
            <div className="event-log" ref={eventLogRef}>
              {eventLog.length === 0 ? (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Click "Enable Logging" then interact with the lightbox…
                </span>
              ) : (
                eventLog.map((entry, i) => (
                  <div className="entry" key={i}>
                    <span className="time">[{entry.time}]</span> {entry.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <BosLightbox
        items={ITEMS}
        open={modalOpen}
        initialIndex={openIndex}
        loop closeOnOverlay closeOnEscape downloadable displayMode="modal"
        onOpen={handleModalOpen} onClose={handleModalClose}
        onItemChange={handleItemChange} onDownload={handleDownload} onError={handleError}
      />

      <hr className="section-divider" />

      {/* ─── Feature Showcase ─── */}
      <div className="container">
        <section ref={showcaseSectionRef} className={`reveal-section ${showcaseSectionInView ? "visible" : ""}`}>
          <div className="section-header">
            <h2>See It In Action</h2>
            <p>Click "Play" on any card to open the lightbox and experience the feature live.</p>
          </div>
          <div className="demo-cards-grid">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className={`${showcaseSectionInView ? "stagger-card" : ""}`}
                style={showcaseSectionInView ? { animationDelay: `${i * 100}ms` } : undefined}
              >
                <FeatureDemoCard feature={feat} onPlay={handlePlayDemo} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <hr className="section-divider" />

      {/* ─── Props Playground ─── */}
      <div className="container">
        <section ref={playgroundSectionRef} className={`reveal-section ${playgroundSectionInView ? "visible" : ""}`}>
          <div className="section-header">
            <h2>Props Playground</h2>
            <p>Tweak props and see the lightbox update in real time. The generated JSX shows the equivalent code.</p>
          </div>
          <PropsPlayground />
        </section>
      </div>

      <hr className="section-divider" />

      {/* ─── Code Examples ─── */}
      <div className="container">
        <section ref={examplesSectionRef} className={`reveal-section ${examplesSectionInView ? "visible" : ""}`}>
          <div className="section-header">
            <h2>Code Examples</h2>
            <p>Ready-to-use snippets for common integration patterns.</p>
          </div>
          <CodeExamples />
        </section>
      </div>

      <hr className="section-divider" />

      {/* ─── API Reference ─── */}
      <div className="container">
        <section ref={apiSectionRef} className={`reveal-section ${apiSectionInView ? "visible" : ""}`}>
          <div className="section-header">
            <h2>API Reference</h2>
            <p>All props, event callbacks, and ref methods supported by BosLightbox.</p>
          </div>

          <div className="api-table-wrap">
            <table className="api-table">
              <thead>
                <tr><th>Prop</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>items</code></td><td><span className="type-badge type-required">required</span></td><td>Array of <code>{`{url, type, name}`}</code> preview items</td></tr>
                <tr><td><code>open</code></td><td><span className="type-badge type-required">required</span></td><td>Boolean — shows/hides the lightbox</td></tr>
                <tr><td><code>initialIndex</code></td><td><span className="type-badge type-optional">optional</span></td><td>Starting item index (default <code>0</code>)</td></tr>
                <tr><td><code>loop</code></td><td><span className="type-badge type-optional">optional</span></td><td>Circular navigation (default <code>false</code>)</td></tr>
                <tr><td><code>closeOnOverlay</code></td><td><span className="type-badge type-optional">optional</span></td><td>Close on overlay click (default <code>true</code>)</td></tr>
                <tr><td><code>closeOnEscape</code></td><td><span className="type-badge type-optional">optional</span></td><td>Close on <kbd>Esc</kbd> (default <code>true</code>)</td></tr>
                <tr><td><code>displayMode</code></td><td><span className="type-badge type-optional">optional</span></td><td><code>"modal"</code> or <code>"inline"</code> (default <code>"modal"</code>)</td></tr>
                <tr><td><code>downloadable</code></td><td><span className="type-badge type-optional">optional</span></td><td>Show download button (default <code>true</code>)</td></tr>
                <tr><td><code>className</code></td><td><span className="type-badge type-optional">optional</span></td><td>CSS class for the root element</td></tr>
                <tr><td><code>style</code></td><td><span className="type-badge type-optional">optional</span></td><td>Inline styles for the root element</td></tr>
                <tr><td><code>onOpen</code></td><td><span className="type-badge type-event">event</span></td><td>Called when the lightbox opens</td></tr>
                <tr><td><code>onClose</code></td><td><span className="type-badge type-event">event</span></td><td>Called when the lightbox closes</td></tr>
                <tr><td><code>onItemChange</code></td><td><span className="type-badge type-event">event</span></td><td>Called with <code>{`{previousIndex, currentIndex, item}`}</code></td></tr>
                <tr><td><code>onDownload</code></td><td><span className="type-badge type-event">event</span></td><td>Called with <code>{`{item}`}</code> on download</td></tr>
                <tr><td><code>onError</code></td><td><span className="type-badge type-event">event</span></td><td>Called with <code>{`{item, error}`}</code> on load errors</td></tr>
              </tbody>
            </table>
          </div>

          <div className="api-section-title">Ref Methods</div>
          <p className="api-section-desc">Available via the <code>ref</code> prop after <code>useRef&lt;BosLightboxRef&gt;</code>.</p>
          <div className="api-table-wrap">
            <table className="api-table">
              <thead><tr><th>Method</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td><code>openAt(index)</code></td><td>Open the lightbox at a specific item index</td></tr>
                <tr><td><code>goTo(index)</code></td><td>Navigate to a specific item by index</td></tr>
                <tr><td><code>next()</code></td><td>Navigate to the next item</td></tr>
                <tr><td><code>prev()</code></td><td>Navigate to the previous item</td></tr>
                <tr><td><code>close()</code></td><td>Close the lightbox programmatically</td></tr>
                <tr><td><code>getCurrentIndex()</code></td><td>Get the current item index</td></tr>
                <tr><td><code>getCurrentItem()</code></td><td>Get the current item object</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <hr className="section-divider" />

      {/* ─── Features Grid ─── */}
      <div className="container">
        <section ref={featuresSectionRef} className={`reveal-section ${featuresSectionInView ? "visible" : ""}`}>
          <div className="section-header">
            <h2>Why BosLightbox?</h2>
            <p>A focused lightbox that does one thing well — preview documents with minimal configuration.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {[
              { icon: "🖼️", title: "Image Zoom", desc: "Zoom in/out with intuitive controls and smooth transitions. Supports any image format the browser can render." },
              { icon: "📄", title: "PDF Preview", desc: "Native PDF viewer integration with iframe-based rendering for document previews." },
              { icon: "⌨️", title: "Keyboard Nav", desc: "Arrow keys for navigation, Escape to close, full focus management with native dialog." },
              { icon: "📱", title: "Touch Gestures", desc: "Swipe left/right to navigate between items on mobile devices and touch screens." },
              { icon: "♿", title: "Accessible", desc: "ARIA attributes, focus trapping, semantic HTML, and screen reader support built in." },
              { icon: "🎯", title: "TypeScript", desc: "Full type definitions included. All props, events, and ref methods are strictly typed." },
              { icon: "🔗", title: "Loop Mode", desc: "Optional circular navigation — wrap from the last item back to the first seamlessly." },
              { icon: "📦", title: "Lightweight", desc: "No external dependencies beyond React. Tree-shakeable ESM and UMD builds." },
            ].map((feat, i) => (
              <div key={i} className={`${featuresSectionInView ? "stagger-card" : ""}`}
                style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: 24, transition: "border-color 0.15s",
                  ...(featuresSectionInView ? { animationDelay: `${i * 70}ms` } : {}),
                }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{feat.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{feat.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

/* ─── Mount ─── */

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
