import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { createRef } from "react";
import { BosLightbox, type BosLightboxRef } from "../src/BosLightbox";
import type { PreviewItem } from "../src/types";

const IMAGE_ITEMS: PreviewItem[] = [
  { type: "image", url: "https://picsum.photos/seed/1/800/600", name: "Image 1" },
  { type: "image", url: "https://picsum.photos/seed/2/800/600", name: "Image 2" },
];

const MIXED_ITEMS: PreviewItem[] = [
  { type: "image", url: "https://picsum.photos/seed/a/800/600", name: "Photo A" },
  { type: "pdf", url: "https://example.com/doc.pdf", name: "Document B" },
  { type: "other", url: "#", name: "File C" },
];

const VIDEO_ITEMS: PreviewItem[] = [
  { type: "video", url: "https://example.com/video.mp4", name: "Video Clip" },
];

const SINGLE_ITEM: PreviewItem[] = [
  { type: "image", url: "https://picsum.photos/seed/single/800/600", name: "Solo Image" },
];

describe("BosLightbox", () => {
  beforeEach(() => {
    // Clear any lingering body overflow styles
    document.body.style.overflow = "";
  });

  describe("Visibility", () => {
    it("renders nothing when closed", () => {
      const { container } = render(
        <BosLightbox items={IMAGE_ITEMS} open={false} />,
      );
      expect(container.innerHTML).toBe("");
    });

    it("renders content when open", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} />,
      );
      expect(screen.getByLabelText("Document preview")).toBeInTheDocument();
    });

    it("locks body scroll when open and restores on close", () => {
      const { rerender } = render(
        <BosLightbox items={IMAGE_ITEMS} open={true} />,
      );
      expect(document.body.style.overflow).toBe("hidden");

      rerender(
        <BosLightbox items={IMAGE_ITEMS} open={false} />,
      );
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Header", () => {
    it("displays the current item name", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} initialIndex={1} />,
      );
      expect(screen.getByText("Image 2")).toBeInTheDocument();
    });

    it("displays the counter for multiple items", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} />,
      );
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
    });

    it("shows download button when downloadable is true", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} downloadable={true} />,
      );
      expect(screen.getByLabelText("Download")).toBeInTheDocument();
    });

    it("hides download button when downloadable is false", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} downloadable={false} />,
      );
      expect(screen.queryByLabelText("Download")).not.toBeInTheDocument();
    });

    it("does not show counter for single item", () => {
      render(
        <BosLightbox items={SINGLE_ITEM} open={true} />,
      );
      expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("shows previous/next nav arrows for modal mode with multiple items", () => {
      render(
        <BosLightbox items={MIXED_ITEMS} open={true} />,
      );
      expect(screen.getByLabelText("Previous image")).toBeInTheDocument();
      expect(screen.getByLabelText("Next image")).toBeInTheDocument();
    });

    it("does not show nav arrows for single item", () => {
      render(
        <BosLightbox items={SINGLE_ITEM} open={true} />,
      );
      expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
    });

    it("fires onItemChange when navigating", () => {
      const onItemChange = vi.fn();
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={0}
          onItemChange={onItemChange}
        />,
      );

      onItemChange.mockClear();

      fireEvent.click(screen.getByLabelText("Next image"));

      expect(onItemChange).toHaveBeenCalledTimes(1);
      expect(onItemChange).toHaveBeenCalledWith(
        expect.objectContaining({
          previousIndex: 0,
          currentIndex: 1,
        }),
      );
    });

    it("fires onClose when close button is clicked", () => {
      const onClose = vi.fn();
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} onClose={onClose} />,
      );

      fireEvent.click(screen.getByLabelText("Close"));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("prev arrow is disabled on first item without loop", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} initialIndex={0} loop={false} />,
      );
      const prevBtn = screen.getByLabelText("Previous image");
      expect(prevBtn).toBeDisabled();
    });

    it("next arrow is disabled on last item without loop", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} initialIndex={1} loop={false} />,
      );
      const nextBtn = screen.getByLabelText("Next image");
      expect(nextBtn).toBeDisabled();
    });
  });

  describe("Loop mode", () => {
    it("wraps from last item back to first", () => {
      const onItemChange = vi.fn();
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={1}
          loop={true}
          onItemChange={onItemChange}
        />,
      );

      onItemChange.mockClear();
      fireEvent.click(screen.getByLabelText("Next image"));
      expect(onItemChange).toHaveBeenCalledWith(
        expect.objectContaining({ previousIndex: 1, currentIndex: 0 }),
      );
    });

    it("wraps from first item back to last when going prev", () => {
      const onItemChange = vi.fn();
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={0}
          loop={true}
          onItemChange={onItemChange}
        />,
      );

      onItemChange.mockClear();
      fireEvent.click(screen.getByLabelText("Previous image"));
      expect(onItemChange).toHaveBeenCalledWith(
        expect.objectContaining({ previousIndex: 0, currentIndex: 1 }),
      );
    });
  });

  describe("Keyboard navigation", () => {
    it("navigates next with ArrowRight key", () => {
      const onItemChange = vi.fn();
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={0}
          onItemChange={onItemChange}
        />,
      );

      onItemChange.mockClear();
      fireEvent.keyDown(window, { key: "ArrowRight" });

      expect(onItemChange).toHaveBeenCalledWith(
        expect.objectContaining({ previousIndex: 0, currentIndex: 1 }),
      );
    });

    it("navigates previous with ArrowLeft key", () => {
      const onItemChange = vi.fn();
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={1}
          onItemChange={onItemChange}
        />,
      );

      onItemChange.mockClear();
      fireEvent.keyDown(window, { key: "ArrowLeft" });

      expect(onItemChange).toHaveBeenCalledWith(
        expect.objectContaining({ previousIndex: 1, currentIndex: 0 }),
      );
    });
  });

  describe("Inline mode", () => {
    it("renders header nav buttons", () => {
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          displayMode="inline"
        />,
      );
      expect(screen.getByLabelText("Previous")).toBeInTheDocument();
      expect(screen.getByLabelText("Next")).toBeInTheDocument();
    });

    it("renders with dialog role", () => {
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          displayMode="inline"
        />,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("closes on Escape key when closeOnEscape is true", () => {
      const onClose = vi.fn();
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          displayMode="inline"
          closeOnEscape={true}
          onClose={onClose}
        />,
      );

      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("does not close on Escape when closeOnEscape is false", () => {
      const onClose = vi.fn();
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          displayMode="inline"
          closeOnEscape={false}
          onClose={onClose}
        />,
      );

      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });

    it("closes on overlay click when closeOnOverlay is true", () => {
      const onClose = vi.fn();
      const { container } = render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          displayMode="inline"
          closeOnOverlay={true}
          onClose={onClose}
        />,
      );

      // Click the overlay itself (the outermost div with role="dialog")
      const overlay = screen.getByRole("dialog");
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("does not close on overlay click when closeOnOverlay is false", () => {
      const onClose = vi.fn();
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          displayMode="inline"
          closeOnOverlay={false}
          onClose={onClose}
        />,
      );

      const overlay = screen.getByRole("dialog");
      fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Fallback for unsupported type", () => {
    it("shows fallback message and file name for 'other' type", () => {
      render(
        <BosLightbox items={MIXED_ITEMS} open={true} initialIndex={2} />,
      );
      expect(screen.getByText(/Preview not available/)).toBeInTheDocument();
      const fileNameElements = screen.getAllByText("File C");
      expect(fileNameElements).toHaveLength(2);
    });
  });

  describe("Video type", () => {
    it("renders a video element for video items", () => {
      render(
        <BosLightbox items={VIDEO_ITEMS} open={true} />,
      );
      const video = document.querySelector("video");
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
      expect(video).toHaveAttribute("controls");
    });
  });

  describe("Custom renderItem prop", () => {
    it("uses renderItem instead of default rendering", () => {
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          renderItem={(item) => <div data-testid="custom">{item.name}</div>}
        />,
      );

      expect(screen.getByTestId("custom")).toBeInTheDocument();
      // Item name also appears in the header, use getAllByText
      expect(screen.getAllByText("Image 1").length).toBeGreaterThanOrEqual(1);
    });

    it("passes the current item to renderItem", () => {
      const renderItem = vi.fn().mockReturnValue(<div>Custom</div>);
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={1}
          renderItem={renderItem}
        />,
      );

      expect(renderItem).toHaveBeenCalledWith(IMAGE_ITEMS[1]);
    });
  });

  describe("Zoom controls", () => {
    it("renders zoom buttons for image items", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} />,
      );
      expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
      expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
    });

    it("does not show reset button at default zoom", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} />,
      );
      expect(screen.queryByLabelText("Reset zoom")).not.toBeInTheDocument();
    });

    it("shows reset button after zooming in", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} />,
      );

      fireEvent.click(screen.getByLabelText("Zoom in"));
      expect(screen.getByLabelText("Reset zoom")).toBeInTheDocument();
    });

    it("resets zoom when navigating to next item", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} initialIndex={0} />,
      );

      // Zoom in first
      const zoomInBtn = screen.getByLabelText("Zoom in");
      fireEvent.click(zoomInBtn);
      expect(screen.getByLabelText("Reset zoom")).toBeInTheDocument();

      // Navigate
      fireEvent.click(screen.getByLabelText("Next image"));
      // Reset button should be gone (zoom reset to 1)
      expect(screen.queryByLabelText("Reset zoom")).not.toBeInTheDocument();
    });
  });

  describe("Imperative ref API", () => {
    it("provides getCurrentIndex and getCurrentItem via ref", () => {
      const ref = createRef<BosLightboxRef>();
      render(
        <BosLightbox
          ref={ref}
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={1}
        />,
      );

      expect(ref.current?.getCurrentIndex()).toBe(1);
      expect(ref.current?.getCurrentItem()).toEqual(IMAGE_ITEMS[1]);
    });

    it("navigates via goTo method", () => {
      const ref = createRef<BosLightboxRef>();
      render(
        <BosLightbox
          ref={ref}
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={0}
        />,
      );

      act(() => {
        ref.current?.goTo(1);
      });
      expect(ref.current?.getCurrentIndex()).toBe(1);
    });

    it("navigates via next and prev methods", () => {
      const ref = createRef<BosLightboxRef>();
      render(
        <BosLightbox
          ref={ref}
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={0}
        />,
      );

      act(() => {
        ref.current?.next();
      });
      expect(ref.current?.getCurrentIndex()).toBe(1);

      act(() => {
        ref.current?.prev();
      });
      expect(ref.current?.getCurrentIndex()).toBe(0);
    });

    it("closes via ref.close()", () => {
      const onClose = vi.fn();
      const ref = createRef<BosLightboxRef>();
      render(
        <BosLightbox
          ref={ref}
          items={IMAGE_ITEMS}
          open={true}
          onClose={onClose}
        />,
      );

      ref.current?.close();
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("clamps goTo index to valid range", () => {
      const ref = createRef<BosLightboxRef>();
      render(
        <BosLightbox
          ref={ref}
          items={IMAGE_ITEMS}
          open={true}
          initialIndex={0}
        />,
      );

      act(() => {
        ref.current?.goTo(999);
      });
      expect(ref.current?.getCurrentIndex()).toBe(1); // clamped to last

      act(() => {
        ref.current?.goTo(-5);
      });
      expect(ref.current?.getCurrentIndex()).toBe(0); // clamped to first
    });

    it("returns first item via getCurrentItem from initial state", () => {
      const ref = createRef<BosLightboxRef>();
      render(
        <BosLightbox
          ref={ref}
          items={IMAGE_ITEMS}
          open={false}
        />,
      );

      // Even when closed, the ref holds the initial state
      expect(ref.current?.getCurrentItem()).toEqual(IMAGE_ITEMS[0]);
    });
  });

  describe("Event callbacks", () => {
    it("fires onOpen when lightbox opens", () => {
      const onOpen = vi.fn();
      const { rerender } = render(
        <BosLightbox items={IMAGE_ITEMS} open={false} onOpen={onOpen} />,
      );

      rerender(
        <BosLightbox items={IMAGE_ITEMS} open={true} onOpen={onOpen} />,
      );

      expect(onOpen).toHaveBeenCalledOnce();
    });

    it("fires onError when image fails to load", () => {
      const onError = vi.fn();
      render(
        <BosLightbox
          items={[
            { type: "image", url: "https://invalid.example.com/fail.jpg", name: "Broken" },
          ]}
          open={true}
          onError={onError}
        />,
      );

      const img = screen.getByAltText("Broken");
      fireEvent.error(img);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Image failed to load",
        }),
      );
    });
  });

  describe("Edge cases", () => {
    it("renders without error with empty items array when closed", () => {
      const { container } = render(
        <BosLightbox items={[]} open={false} />,
      );
      expect(container.innerHTML).toBe("");
    });

    it("handles out-of-bounds initialIndex gracefully", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} initialIndex={999} />,
      );
      expect(screen.getByText("Image 2")).toBeInTheDocument(); // clamped
    });

    it("handles negative initialIndex", () => {
      render(
        <BosLightbox items={IMAGE_ITEMS} open={true} initialIndex={-5} />,
      );
      expect(screen.getByText("Image 1")).toBeInTheDocument();
    });

    it("applies className and style to root", () => {
      render(
        <BosLightbox
          items={IMAGE_ITEMS}
          open={true}
          className="my-class"
          style={{ color: "red" }}
        />,
      );

      const dialog = screen.getByLabelText("Document preview");
      expect(dialog.className).toContain("my-class");
    });
  });
});
