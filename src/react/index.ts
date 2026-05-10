import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import type { PreviewItem, DownloadEventDetail, ItemChangeEventDetail, ErrorEventDetail } from '../types';

// React wrapper component
export interface BosLightboxProps {
  items: PreviewItem[];
  open: boolean;
  initialIndex?: number;
  loop?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  downloadable?: boolean;
  displayMode?: 'modal' | 'inline';
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
}

export const BosLightbox = forwardRef<BosLightboxRef, BosLightboxProps>(({
  items,
  open,
  initialIndex = 0,
  loop = false,
  closeOnOverlay = true,
  closeOnEscape = true,
  downloadable = true,
  displayMode = 'modal',
  onOpen,
  onClose,
  onItemChange,
  onDownload,
  onError,
  className,
  style,
}, ref) => {
  const lightboxRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useImperativeHandle(ref, () => ({
    openAt: (index: number) => {
      if (lightboxRef.current) {
        lightboxRef.current.openAt(index);
      }
    },
    goTo: (index: number) => {
      if (lightboxRef.current) {
        lightboxRef.current.goTo(index);
      }
    },
    next: () => {
      if (lightboxRef.current) {
        lightboxRef.current.next();
      }
    },
    prev: () => {
      if (lightboxRef.current) {
        lightboxRef.current.prev();
      }
    },
    close: () => {
      if (lightboxRef.current) {
        lightboxRef.current.open = false;
      }
    },
    getCurrentIndex: () => currentIndex,
    getCurrentItem: () => items[currentIndex],
  }), [currentIndex, items]);

  useEffect(() => {
    const element = lightboxRef.current;
    if (!element) return;

    const handleOpen = () => onOpen?.();
    const handleClose = () => onClose?.();
    const handleItemChange = (event: CustomEvent<ItemChangeEventDetail>) => {
      const detail = event.detail;
      setCurrentIndex(detail.currentIndex);
      onItemChange?.(detail);
    };
    const handleDownload = (event: CustomEvent<DownloadEventDetail>) => {
      onDownload?.(event.detail);
    };
    const handleError = (event: CustomEvent<ErrorEventDetail>) => {
      onError?.(event.detail);
    };

    element.addEventListener('open', handleOpen);
    element.addEventListener('close', handleClose);
    element.addEventListener('item-change', handleItemChange);
    element.addEventListener('download', handleDownload);
    element.addEventListener('error', handleError);

    return () => {
      element.removeEventListener('open', handleOpen);
      element.removeEventListener('close', handleClose);
      element.removeEventListener('item-change', handleItemChange);
      element.removeEventListener('download', handleDownload);
      element.removeEventListener('error', handleError);
    };
  }, [onOpen, onClose, onItemChange, onDownload, onError]);

  useEffect(() => {
    if (lightboxRef.current) {
      lightboxRef.current.items = items;
      lightboxRef.current.open = open;
      lightboxRef.current.initialIndex = initialIndex;
      lightboxRef.current.loop = loop;
      lightboxRef.current.closeOnOverlay = closeOnOverlay;
      lightboxRef.current.closeOnEscape = closeOnEscape;
      lightboxRef.current.downloadable = downloadable;
      lightboxRef.current.displayMode = displayMode;
    }
  }, [items, open, initialIndex, loop, closeOnOverlay, closeOnEscape, downloadable, displayMode]);

  return React.createElement('document-preview', {
    ref: lightboxRef,
    className,
    style,
  });
});

BosLightbox.displayName = 'BosLightbox';
