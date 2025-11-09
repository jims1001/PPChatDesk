export interface ChatMessage {
  _id: string;
  TenantID: string;
  client_msg_id: string;
  server_msg_id: string;
  create_time_ms: number;
  send_time_ms: number;
  session_type: number;
  send_id: string;
  recv_id: string;
  msg_from: number;
  content_type: number;
  sender_platform_id: number;
  sender_nickname: string;
  sender_face_url: string;
  conversation_id: string;
  seq_num: number;
  text_elem?: {
    content: string;
  };
  content_text?: string;
}
