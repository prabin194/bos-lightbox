# bos-lightbox

A framework-agnostic document preview lightbox web component. Built with Lit, supports images, PDFs, and other file types with keyboard navigation and touch gestures.

## Features

- 🖼️ **Image Preview** - Zoom, pan, and download images
- 📄 **PDF Preview** - Native PDF viewer integration
- 📱 **Touch Gestures** - Swipe navigation on mobile devices
- ⌨️ **Keyboard Navigation** - Arrow keys, Escape to close
- ♿ **Accessibility** - ARIA attributes, focus trapping
- 🎨 **Customizable** - CSS variables for styling
- 📦 **Framework Agnostic** - Works with any web framework
- 🔗 **Circular Navigation** - Optional loop through items

## Installation

```bash
npm install bos-lightbox
```

## Usage

### Basic Usage

```html
<script type="module">
  import 'bos-lightbox';
</script>

<document-preview id="lightbox"></document-preview>

<button onclick="openLightbox()">Open Gallery</button>

<script>
  const lightbox = document.getElementById('lightbox');
  
  function openLightbox() {
    lightbox.items = [
      { type: 'image', url: 'image1.jpg', name: 'Image 1' },
      { type: 'pdf', url: 'document.pdf', name: 'Document' },
      { type: 'image', url: 'image2.jpg', name: 'Image 2' }
    ];
    lightbox.open = true;
  }
</script>
```

### React Integration

#### Option 1: React Wrapper Component (Recommended)

```jsx
import React, { useRef } from 'react';
import { BosLightbox } from 'bos-lightbox/react';
import 'bos-lightbox';

function Gallery() {
  const lightboxRef = useRef(null);
  
  const items = [
    { type: 'image', url: 'image1.jpg', name: 'Image 1' },
    { type: 'pdf', url: 'document.pdf', name: 'Document' },
    { type: 'image', url: 'image2.jpg', name: 'Image 2' }
  ];
  
  const handleOpen = () => console.log('Lightbox opened');
  const handleClose = () => console.log('Lightbox closed');
  const handleItemChange = (detail) => console.log('Item changed:', detail);
  
  return (
    <>
      <BosLightbox
        ref={lightboxRef}
        items={items}
        open={true}
        initialIndex={0}
        loop={true}
        onOpen={handleOpen}
        onClose={handleClose}
        onItemChange={handleItemChange}
      />
      
      <button onClick={() => lightboxRef.current?.openAt(0)}>
        Open Image 1
      </button>
      <button onClick={() => lightboxRef.current?.openAt(1)}>
        Open PDF
      </button>
    </>
  );
}
```

#### Option 2: React Hook Integration

```jsx
import React from 'react';
import { useBosLightbox } from 'bos-lightbox/react';
import 'bos-lightbox';

function Gallery() {
  const items = [
    { type: 'image', url: 'image1.jpg', name: 'Image 1' },
    { type: 'pdf', url: 'document.pdf', name: 'Document' }
  ];
  
  const {
    isOpen,
    currentIndex,
    currentItem,
    open,
    close,
    next,
    prev,
    goTo,
    lightboxProps
  } = useBosLightbox({
    items,
    loop: true,
    downloadable: true
  });
  
  return (
    <>
      <document-preview {...lightboxProps} />
      
      <div className="gallery">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => open(index)}
            className="thumbnail"
          >
            {item.name}
          </button>
        ))}
      </div>
      
      {isOpen && (
        <div className="controls">
          <button onClick={prev} disabled={currentIndex === 0}>
            Previous
          </button>
          <span>
            {currentIndex + 1} / {items.length}
          </span>
          <button onClick={next} disabled={currentIndex === items.length - 1}>
            Next
          </button>
          <button onClick={close}>Close</button>
        </div>
      )}
    </>
  );
}
```

#### Option 3: Direct Web Component Usage

```jsx
import { useEffect, useRef } from 'react';
import 'bos-lightbox';

function Gallery() {
  const lightboxRef = useRef(null);
  
  const items = [
    { type: 'image', url: 'image1.jpg', name: 'Image 1' },
    { type: 'pdf', url: 'document.pdf', name: 'Document' }
  ];
  
  const openLightbox = (index) => {
    lightboxRef.current.items = items;
    lightboxRef.current.openAt(index);
  };
  
  return (
    <>
      <document-preview ref={lightboxRef} />
      <button onClick={() => openLightbox(0)}>Open Image</button>
      <button onClick={() => openLightbox(1)}>Open PDF</button>
    </>
  );
}
```

#### TypeScript Support

```tsx
import React, { useRef } from 'react';
import { BosLightbox, BosLightboxRef } from 'bos-lightbox/react';
import type { PreviewItem } from 'bos-lightbox';

interface GalleryProps {
  items: PreviewItem[];
}

function Gallery({ items }: GalleryProps) {
  const lightboxRef = useRef<BosLightboxRef>(null);
  
  const handleItemChange = (detail: {
    previousIndex: number;
    currentIndex: number;
    item: PreviewItem;
  }) => {
    console.log('Changed to:', detail.item.name);
  };
  
  return (
    <BosLightbox
      ref={lightboxRef}
      items={items}
      open={false}
      onItemChange={handleItemChange}
    />
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <document-preview 
      ref="lightbox"
      :items="items"
      :open="isOpen"
      @close="isOpen = false"
    />
    
    <button @click="openLightbox(0)">Open Gallery</button>
  </div>
</template>

<script>
import 'bos-lightbox';

export default {
  data() {
    return {
      isOpen: false,
      items: [
        { type: 'image', url: 'image1.jpg', name: 'Image 1' },
        { type: 'pdf', url: 'document.pdf', name: 'Document' }
      ]
    };
  },
  methods: {
    openLightbox(index) {
      this.$refs.lightbox.openAt(index);
      this.isOpen = true;
    }
  }
};
</script>
```

## API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `items` | `PreviewItem[]` | `[]` | Array of items to preview |
| `open` | `boolean` | `false` | Whether the lightbox is open |
| `initialIndex` | `number` | `0` | Index of the item to show when opened |
| `loop` | `boolean` | `false` | Enable circular navigation |
| `closeOnOverlay` | `boolean` | `true` | Close when clicking the overlay |
| `closeOnEscape` | `boolean` | `true` | Close when pressing Escape |
| `downloadable` | `boolean` | `true` | Show the download button |
| `displayMode` | `'modal' \| 'inline'` | `'modal'` | Display mode |

### PreviewItem Interface

```typescript
interface PreviewItem {
  type: 'image' | 'pdf' | 'other';
  url: string;
  name: string;
}
```

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `openAt(index)` | `index: number` | Open lightbox at specific item |
| `goTo(index)` | `index: number` | Navigate to specific item |
| `next()` | - | Navigate to next item |
| `prev()` | - | Navigate to previous item |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `open` | - | Fired when lightbox opens |
| `close` | - | Fired when lightbox closes |
| `item-change` | `{ previousIndex, currentIndex, item }` | Fired when current item changes |
| `download` | `{ item }` | Fired when download is triggered |
| `error` | `{ item, error }` | Fired when an error occurs |

## Styling

The component uses CSS variables for customization:

```css
document-preview {
  --overlay-bg: rgba(0, 0, 0, 0.8);
  --container-bg: #fff;
  --header-bg: #f5f5f5;
  --text-color: #333;
  --border-color: #ddd;
  --button-bg: #fff;
  --button-hover-bg: #f0f0f0;
}
```

## Keyboard Shortcuts

- `Arrow Left` - Previous item
- `Arrow Right` - Next item
- `Escape` - Close lightbox

## Touch Gestures

- Swipe left/right - Navigate between items
- Tap on overlay - Close lightbox (if `closeOnOverlay` is true)

## Browser Support

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Dependencies

- Lit 3.x

## License

MIT
