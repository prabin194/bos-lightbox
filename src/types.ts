export interface PreviewItem {
  url: string;
  type: "image" | "pdf" | "video" | "other";
  name: string;
}

export interface DownloadEventDetail {
  item: PreviewItem;
}

export interface ItemChangeEventDetail {
  previousIndex: number;
  currentIndex: number;
  item: PreviewItem;
}

export interface ErrorEventDetail {
  item: PreviewItem;
  error: string;
}
