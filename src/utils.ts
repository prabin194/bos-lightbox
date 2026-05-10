export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("disabled"));
}

export function trapFocus(event: KeyboardEvent, focusableElements: HTMLElement[]): void {
  if (event.key !== "Tab") return;
  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

export function setAriaHidden(hidden: boolean): void {
  const siblings: Element[] = [];
  let parent: HTMLElement | null = document.documentElement;
  while (parent) {
    for (const child of parent.children) {
      if (!child.hasAttribute("aria-hidden")) {
        siblings.push(child);
      }
    }
    parent = parent.parentElement;
  }
  siblings.forEach((el) => {
    if (hidden) {
      el.setAttribute("aria-hidden", "true");
    } else {
      el.removeAttribute("aria-hidden");
    }
  });
}
