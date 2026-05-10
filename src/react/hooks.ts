import { useState, useCallback, useRef } from 'react';
import type { PreviewItem, ItemChangeEventDetail, ErrorEventDetail, DownloadEventDetail } from '../types';

export interface UseBosLightboxOptions {
  items: PreviewItem[];
  initialIndex?: number;
  loop?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  downloadable?: boolean;
  displayMode?: 'modal' | 'inline';
}

export interface UseBosLightboxReturn {
  isOpen: boolean;
  currentIndex: number;
  currentItem: PreviewItem | undefined;
  open: (index?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  lightboxProps: {
    items: PreviewItem[];
    open: boolean;
    initialIndex: number;
    loop: boolean;
    closeOnOverlay: boolean;
    closeOnEscape: boolean;
    downloadable: boolean;
    displayMode: 'modal' | 'inline';
  };
}

export const useBosLightbox = (options: UseBosLightboxOptions): UseBosLightboxReturn => {
  const {
    items,
    initialIndex = 0,
    loop = false,
    closeOnOverlay = true,
    closeOnEscape = true,
    downloadable = true,
    displayMode = 'modal',
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const open = useCallback((index?: number) => {
    if (index !== undefined && index >= 0 && index < items.length) {
      setCurrentIndex(index);
    }
    setIsOpen(true);
  }, [items.length]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex(prev => {
      if (loop) {
        return (prev + 1) % items.length;
      }
      return Math.min(prev + 1, items.length - 1);
    });
  }, [items.length, loop]);

  const prev = useCallback(() => {
    setCurrentIndex(prev => {
      if (loop) {
        return prev === 0 ? items.length - 1 : prev - 1;
      }
      return Math.max(prev - 1, 0);
    });
  }, [items.length, loop]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentIndex(index);
    }
  }, [items.length]);

  const currentItem = items[currentIndex];

  return {
    isOpen,
    currentIndex,
    currentItem,
    open,
    close,
    next,
    prev,
    goTo,
    lightboxProps: {
      items,
      open: isOpen,
      initialIndex: currentIndex,
      loop,
      closeOnOverlay,
      closeOnEscape,
      downloadable,
      displayMode,
    },
  };
};

export interface UseBosLightboxEventsOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onItemChange?: (detail: ItemChangeEventDetail) => void;
  onDownload?: (detail: DownloadEventDetail) => void;
  onError?: (detail: ErrorEventDetail) => void;
}

export const useBosLightboxEvents = (
  lightboxRef: React.RefObject<any>,
  options: UseBosLightboxEventsOptions
) => {
  const { onOpen, onClose, onItemChange, onDownload, onError } = options;

  React.useEffect(() => {
    const element = lightboxRef.current;
    if (!element) return;

    const handleOpen = () => onOpen?.();
    const handleClose = () => onClose?.();
    const handleItemChange = (event: CustomEvent<ItemChangeEventDetail>) => {
      onItemChange?.(event.detail);
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
  }, [lightboxRef, onOpen, onClose, onItemChange, onDownload, onError]);
};
