export interface LoginRequest {
  sessionID: string;
  userID: string;
  tenantID: string;
  deviceType: string;
  deviceID: string;
  ip: string;
  userAgent: string;
  scopes: string[];
  ttl: number;
  now: string;
}

export interface LoginResponse {
  session_id: string;
  user_id: string;
  tenant_id: string;
  device_type: string;
  device_id: string;
  access_token: string;
  access_token_hash: string;
  login_time: string;
  last_active: string;
  expire_time: string;
  expire_at: string;
  status: string;
  is_valid: boolean;
}
