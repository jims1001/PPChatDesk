// 对方用户信息
export interface ChatUserInfo {
  UserID: string;
  TenantID: string;
  Nickname: string;
  FaceURL: string;
  Bio?: string;
  AccountType?: number;
  AppMangerLevel?: number;
  Status?: number;
  IsDeleted?: boolean;
  DeletedAt?: string | null;
  GlobalRecvMsgOpt?: number;
  MuteUntil?: string;
  Language?: string;
  Timezone?: string;
  Phone?: string;
  Email?: string;
  PhoneVerified?: boolean;
  EmailVerified?: boolean;
  TwoFAEnabled?: boolean;
  LastLoginIP?: string;
  LastLoginTime?: string;
  Presence?: string;
  LastActive?: string;
  CreateTime?: string;
  UpdateTime?: string;
  Ex?: string;
}

export interface ChatConversation {
  TenantID: string;
  OwnerUserID: string;
  ConversationID: string;
  ConversationType: number;
  UserID?: string;
  GroupID?: string;
  RecvMsgOpt: number;
  IsPinned: boolean;
  IsPrivateChat: boolean;
  BurnDuration: number;
  GroupAtType: number;
  AttachedInfo: string;
  Ex: string;
  ReadSeq: number;
  ReadOutboxSeq: number;
  LocalMaxSeq: number;
  MentionUnread: number;
  MentionReadSeq: number;
  MinSeq: number;
  ServerMaxSeq: number;
  PerDeviceReadSeq?: Record<string, number> | null;
  CreateTime: string;
  UpdatedAt: string;
  IsMsgDestruct: boolean;
  MsgDestructTime: string;
  LatestMsgDestructTime: string;
  UserInfo?: ChatUserInfo; // 关键：对方资料
}

// 后端统一返回结构
export interface ListConversationsResp {
  code: number;
  msg: string;
  data: ChatConversation[];
}
