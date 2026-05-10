import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.92);
    backdrop-filter: blur(4px);
    will-change: transform, backdrop-filter;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .overlay.inline {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #000;
    opacity: 1;
  }

  .overlay.open {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .overlay.open {
      transition: none;
    }
    .container {
      transition: none;
    }
  }

  .container {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    transform: scale(0.95);
    transition: transform 0.2s ease, opacity 0.2s ease;
    opacity: 0;
  }

  .overlay.inline .container {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }

  .container.open {
    transform: scale(1);
    opacity: 1;
  }

  .overlay.inline .header {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(0, 0, 0, 0.8);
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 10;
  }

  .overlay.inline .header-name {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    margin-right: 8px;
  }

  .overlay.inline .header-btn {
    background: transparent;
    color: #fff;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 4px;
  }

  .overlay.inline .header-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    min-height: 52px;
  }

  .header-name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    min-width: 40px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    padding: 0;
  }

  .header-btn:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: -2px;
  }

  .header-btn:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .overlay.inline .content-area {
    background: #000;
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .content-area {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    min-height: 300px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .overlay.inline .content-area img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
  }

  .content-area img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    transition: opacity 0.2s ease;
    cursor: grab;
  }

  .content-area img:active {
    cursor: grabbing;
  }

  .content-area img.zoomed {
    max-width: none;
    max-height: none;
    object-fit: none;
    cursor: grab;
  }

  .overlay.inline .content-area iframe {
    width: 90vw;
    height: 90vh;
    border: none;
    border-radius: 8px;
  }

  .content-area iframe {
    width: 100%;
    flex: 1;
    min-height: 0;
    height: 100%;
    border: none;
  }

  .fallback {
    text-align: center;
    padding: 48px 32px;
  }

  .fallback-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin: 0 auto 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
  }

  .fallback-title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 8px;
  }

  .fallback-desc {
    font-size: 13px;
    color: #9ca3af;
    margin: 0 0 16px;
  }

  .error-message {
    text-align: center;
    padding: 48px 32px;
  }

  .error-message .error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin: 0 auto 12px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .error-message p {
    color: #9ca3af;
    font-size: 13px;
  }

  .download-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border: none;
    border-radius: 8px;
    background: #2563eb;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .download-btn:focus-visible {
    outline: 2px solid #93c5fd;
    outline-offset: 2px;
  }

  .download-btn:hover {
    background: #1d4ed8;
  }

  .overlay.inline .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  .overlay.inline .nav-btn:hover {
    background: rgba(0, 0, 0, 0.9);
  }

  .overlay.inline .nav-prev {
    left: 24px;
  }

  .overlay.inline .nav-next {
    right: 24px;
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    color: #1f2937;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: background 0.15s, transform 0.15s;
    padding: 0;
  }

  .nav-btn:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }

  .nav-btn:hover {
    background: #fff;
    transform: translateY(-50%) scale(1.05);
  }

  .nav-prev {
    left: 12px;
  }

  .nav-next {
    right: 12px;
  }

  .overlay.inline .counter {
    position: absolute;
    top: 16px;
    left: 16px;
    padding: 6px 16px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-size: 12px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .footer {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    color: #6b7280;
  }

  .footer svg {
    width: 14px;
    height: 14px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .hidden {
    opacity: 0;
    position: absolute;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 1.5s;
    }
  }

  .overlay.inline .zoom-controls {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.9);
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .overlay.inline .zoom-btn {
    background: transparent;
    color: #fff;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 4px;
  }

  .overlay.inline .zoom-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .overlay.inline .dots-indicator {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .overlay.inline .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: background 0.2s ease;
  }

  .overlay.inline .dot.active {
    background: #fff;
  }

  .zoom-controls {
    position: absolute;
    bottom: 12px;
    left: 12px;
    display: flex;
    gap: 4px;
  }

  .zoom-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s;
  }

  .zoom-btn:focus-visible {
    outline: 2px solid #93c5fd;
    outline-offset: 2px;
  }

  .zoom-btn:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .zoom-level {
    display: flex;
    align-items: center;
    padding: 0 8px;
    font-size: 11px;
    color: #ccc;
  }
`;
