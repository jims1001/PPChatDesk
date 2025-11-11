
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import SupportInboxLayout from '@/components/layout'
import InboxMy from '@/pages/inbox/my'
import InboxUnassigned from '@/pages/inbox/unassigned'
import InboxAll from '@/pages/inbox/all'
import InboxMentions from '@/pages/inbox/mentions'
import Contacts from '@/pages/contacts'
import Reports from '@/pages/reports'
import Activities from '@/pages/activities'
import Help from '@/pages/help'
import Settings from '@/pages/settings'


import { useWSList } from "@/net/lib/ws/useWSList";
import { useEffect, useRef } from 'react'
import ResizableThreePanesDemo from './pages/demo'
import ChatWindow from '@/pages/chat/messageview'
import { useLogin } from "@/data/user/hook/useLogin";
import { useGetUser } from "@/data/user/hook/useGetUser";
import EmptyConversation from './pages/chat/empty'

// import { useGet } from './net/hook/useGet'



const baseAuthFrame = {
  type: 9,
  from: "user_10001",
  to: "gateway_auth",
  ts: 1724670000456,
  gateway_id: "gw-1a",
  conn_id: "c-77f0d2",
  tenant_id: "tenant_001",
  app_id: "im_app",
  qos: 1,
  priority: 0,
  ack_required: true,
  ack_id: "ack-9de0a2d7",
  dedup_id: "auth-9de0a2d7",
  nonce: "e3d9c0a7f4b2",
  expires_at: 1724670060000,
  trace_id: "tr-2f8d1c0b5a",
  device_id: "aabbccddeeff00112233",
  platform: "Web",
  app_version: "1.0.3",
  locale: "zh-CN",
  session_id: "749950580004634624",
  meta: {
    ip: "203.0.113.10",
    ua: "Chrome/139",
  },
  payload: {
    client_msg_id: "cmid-0001",
    server_msg_id: "",
    create_time: 1724670000456,
    send_time: 0,
    session_type: 4,
    send_id: "user_10001",
    recv_id: "gateway_auth",
    msg_from: 1,
    content_type: 399,
    sender_platform_id: 5,
    sender_nickname: "heng heng",
    sender_face_url: "",
    group_id: "",
    content: "",
    seq: 0,
    is_read: false,
    status: 0,
    custom_elem: {
      description: "auth",
      extension: "v1",
      data: {
        type: "auth",
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTY2NDM5MTgsImlhdCI6MTc1NjYzNjcxOCwibmJmIjoxNzU2NjM2NzE4LCJzY29wZSI6WyJyZWFkIiwid3JpdGUiLCJwcm9maWxlIl0sInN1YiI6InVfMTAwMDEifQ.LD-UYnBHhEz88gnlNEzSZl3W50D2WuUayEyp8KAHjhw",
        token_hash:
          "sha256:5e1ae7b2f0254e7fd65c9cdceaaf04b3e192eced3fcaef3aadb0c41a7a4a21b1",
        ts: 1724670000456,
        nonce: "e3d9c0a7f4b2",
        user_id: "user_10001",
        device_id: "aabbccddeeff00112233",
        scope: ["read", "write"],
      },
    },
    is_edited: false,
    edited_at: 0,
    edit_version: 0,
    expire_at: 0,
    access_level: "private",
    trace_id: "tr-2f8d1c0b5a",
    tags: [],
  },
};

export default function App() {

  const { login, data } = useLogin();
  const { data: user, mutate } = useGetUser(undefined);


  const handleLogin = async () => {
    // 这里用你给的那个登录请求体
    await login({
      sessionID: "f9c1d1c6-6c85-4c1d-8e23-2f83c62a7f12",
      userID: "user_10001",
      tenantID: "tenant_001",
      deviceType: "ios",
      deviceID: "aabbccddeeff00112233",
      ip: "192.168.1.55",
      userAgent: "iPhone14,2 iOS/17.0 Safari/605.1.15",
      scopes: ["read", "write", "profile"],
      ttl: 3600,
      now: "2025-08-24T13:00:00Z",
    });
  };


  const ws = useWSList<any>({
    listKey: "test",
    reduce: (prev, item) => [...prev, item],
    max: 300,
  });


  useEffect(() => {
    if (!ws.data) return;
    const msg = ws.data as any;
    if (msg.type === 10 && msg.connId) {
      const authFrame = {
        ...baseAuthFrame,
        session_id: msg.connId,
      };
      ws.send?.(authFrame);
    }
  }, [ws.data, ws.send]);

  useEffect(() => {
    if (!data?.access_token) return;
    // 2. 再手动拉一次用户信息
    mutate();
  }, [data?.access_token]);

  // 处理登录逻辑
  useEffect(() => {
    handleLogin();
  }, []);



  return (

    <Routes>
      <Route path="/" element={<ResizableThreePanesDemo />}>

        <Route index element={<Navigate to="empty" replace />} />
        <Route path='empty' element={<EmptyConversation></EmptyConversation>}></Route>
        {/* 
        <Route element={<Navigate to="chat" replace />} /> */}
        <Route path="/chat/:id" key={useParams().id} element={<ChatWindow />} />

        <Route element={<Navigate to="/inbox/my" replace />} />
        <Route path="inbox">
          <Route index element={<Navigate to="my" replace />} />
          <Route path="my" element={<InboxMy />} />
          <Route path="unassigned" element={<InboxUnassigned />} />
          <Route path="all" element={<InboxAll />} />
          <Route path="mentions" element={<InboxMentions />} />
        </Route>
        <Route path="contacts" element={<Contacts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="activities" element={<Activities />} />
        <Route path="help" element={<Help />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/inbox/my" replace />} />
      </Route>
    </Routes>
  )
}
