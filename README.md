# bos-lightbox

A React lightbox component for previewing images, PDFs, videos, and other documents with keyboard navigation, zoom, touch support, and an imperative ref API.

## Features

- 🖼️ **Image Preview** — Zoom, pan (drag when zoomed), and download images
- 🖼️ **Thumbnail Strip** — Bottom thumbnail row for visual navigation between items
- 📄 **PDF Preview** — Native PDF viewer integration via iframe
- 🎬 **Video Support** — Native `<video>` playback with controls and autoplay
- 📱 **Touch Gestures** — Swipe navigation on mobile devices
- ⌨️ **Keyboard Navigation** — Arrow keys, Escape to close (modal and inline)
- ♿ **Accessibility** — ARIA attributes, focus trapping via native `<dialog>`, screen reader support
- 🔗 **Circular Navigation** — Optional loop through items
- 🎨 **Customizable** — `className`, `style`, and `renderItem` props for full control
- 🎯 **TypeScript** — Full type definitions included
- 🎞️ **Animations** — Smooth fade-in on open and fade transitions between items
- 🔁 **Slideshow** — Auto-play with configurable interval and play/pause control
- 📦 **Lightweight** — No external dependencies beyond React. Tree-shakeable ESM and UMD builds
- 🖥️ **SSR Compatible** — Safe for server-side rendering environments

## Installation

```bash
npm install bos-lightbox
```

## Quick Start

```tsx
import { useState } from "react";
import { BosLightbox } from "bos-lightbox";
import type { PreviewItem } from "bos-lightbox";

function Gallery() {
  const [open, setOpen] = useState(false);

  const items: PreviewItem[] = [
    { url: "image1.jpg", type: "image", name: "Photo" },
    { url: "doc.pdf",    type: "pdf",   name: "Document" },
    { url: "video.mp4",  type: "video", name: "Clip" },
    { url: "file.zip",   type: "other", name: "Archive" },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Gallery</button>
      <BosLightbox
        items={items}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
```

## Imperative Ref API

For more control, use the `ref` prop:

```tsx
import { useRef, useState } from "react";
import { BosLightbox } from "bos-lightbox";
import type { BosLightboxRef, PreviewItem } from "bos-lightbox";

function Gallery() {
  const ref = useRef<BosLightboxRef>(null);
  const [open, setOpen] = useState(false);

  const items: PreviewItem[] = [
    { url: "image1.jpg", type: "image", name: "Landscape" },
    { url: "doc.pdf",    type: "pdf",   name: "Report" },
    { url: "arch.zip",   type: "other", name: "Archive" },
  ];

  return (
    <>
      <BosLightbox ref={ref} items={items} open={open} onClose={() => setOpen(false)} />
      <button onClick={() => ref.current?.openAt(0)}>Open Landscape</button>
      <button onClick={() => ref.current?.next()}>Next</button>
      <button onClick={() => ref.current?.prev()}>Previous</button>
    </>
  );
}
```

## Display Modes

### Modal (default)

Uses the native `<dialog>` element with a focus trap, backdrop blur, and Escape-to-close behavior.

```tsx
<BosLightbox items={items} open={open} displayMode="modal" onClose={() => setOpen(false)} />
```

### Inline (full-page overlay)

Renders as a fixed-position overlay without the `<dialog>` element — useful when you need full control over the overlay behavior. Inline mode supports Escape-to-close and overlay click-to-close just like modal mode.

```tsx
<BosLightbox items={items} open={open} displayMode="inline" onClose={() => setOpen(false)} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `PreviewItem[]` | — (required) | Array of items to preview |
| `open` | `boolean` | — (required) | Whether the lightbox is open |
| `initialIndex` | `number` | `0` | Index of the item to show when opened |
| `loop` | `boolean` | `false` | Enable circular navigation (last ↔ first) |
| `closeOnOverlay` | `boolean` | `true` | Close when clicking the overlay background |
| `closeOnEscape` | `boolean` | `true` | Close when pressing Escape |
| `downloadable` | `boolean` | `true` | Show the download button in the header |
| `displayMode` | `"modal" \| "inline"` | `"modal"` | Display mode |
| `renderItem` | `(item) => ReactNode` | — | Custom render function for item content |
| `slideshow` | `boolean` | `false` | Enable auto-playing slideshow mode |
| `slideshowInterval` | `number` | `3000` | Interval in ms between slideshow advances |
| `thumbnails` | `boolean` | `false` | Show a bottom thumbnail strip for visual navigation |
| `className` | `string` | — | CSS class for the root element |
| `style` | `React.CSSProperties` | — | Inline styles for the root element |
| `onOpen` | `() => void` | — | Callback when the lightbox opens |
| `onClose` | `() => void` | — | Callback when the lightbox closes |
| `onItemChange` | `(detail) => void` | — | Callback with `{ previousIndex, currentIndex, item }` |
| `onDownload` | `(detail) => void` | — | Callback with `{ item }` when download is triggered |
| `onError` | `(detail) => void` | — | Callback with `{ item, error }` on load errors |

### PreviewItem

```typescript
interface PreviewItem {
  type: "image" | "pdf" | "video" | "other";
  url: string;
  name: string;
}
```

### renderItem

For complete control over content rendering, pass a custom function:

```tsx
<BosLightbox
  items={items}
  open={open}
  onClose={() => setOpen(false)}
  renderItem={(item) => {
    if (item.type === "image") {
      return <CustomImageViewer url={item.url} />;
    }
    // Fall back to default rendering for other types
    return null; // or <DefaultViewer />
  }}
/>
```

When `renderItem` is provided, it takes precedence over the built-in type-based rendering. Return `null` to render nothing for a particular item.

### Ref Methods (`BosLightboxRef`)

| Method | Description |
|--------|-------------|
| `openAt(index: number)` | Open the lightbox at a specific item index |
| `goTo(index: number)` | Navigate to a specific item by index |
| `next()` | Navigate to the next item |
| `prev()` | Navigate to the previous item |
| `close()` | Close the lightbox programmatically |
| `getCurrentIndex()` | Return the current item index |
| `getCurrentItem()` | Return the current item object |
| `toggleSlideshow()` | Toggle slideshow play/pause |
| `isSlideshowActive()` | Return whether slideshow is currently active |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` Arrow Left | Previous item |
| `→` Arrow Right | Next item |
| `Esc` | Close lightbox (modal and inline) |

## Touch Gestures

- Swipe left/right — Navigate between items
- Tap on overlay — Close lightbox (if `closeOnOverlay` is `true`)

## Browser Support

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## License

MIT
