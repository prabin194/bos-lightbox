import { DocumentPreview } from "./document-preview";

customElements.define("document-preview", DocumentPreview);

export { DocumentPreview };
export type { PreviewItem, DownloadEventDetail, ItemChangeEventDetail, ErrorEventDetail } from "./types";
