export type MessageKind =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "file"
  | "location"
  | "system";

export interface Attachment {
  url: string;
  name?: string;
  size?: number;
  mime?: string;
  width?: number;
  height?: number;
  duration?: number;
  lat?: number;
  lng?: number;
  address?: string;
  thumb?: string;
}

export interface ChatMessage {
  id: string;
  kind: MessageKind;
  direction: "in" | "out" | "system";
  text?: string;
  attachments?: Attachment[];
  createdAt: number;
}
