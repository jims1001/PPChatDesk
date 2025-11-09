export interface User {
  UserID: string;
  TenantID: string;
  Nickname: string;
  FaceURL: string;
  Bio?: string;
  AccountType: number;
  AppMangerLevel: number;
  Status: number;
  IsDeleted: boolean;
  DeletedAt: string | null;
  GlobalRecvMsgOpt: number;
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
  Presence?: "online" | "offline" | "away";
  LastActive?: string;
  CreateTime: string;
  UpdateTime: string;
  Ex?: string; // 扩展字段（一般是 JSON 字符串）
}
