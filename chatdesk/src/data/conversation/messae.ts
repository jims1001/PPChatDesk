export function createTextMessage(
  content: string,
  from = "user_10001",
  to = "user_10002"
) {
  const now = Date.now();
  const ts = String(now);
  const expiresAt = String(now + 1000 * 60 * 60); // 1小时后过期
  const clientMsgId = `cmid-${Math.random().toString(36).slice(2, 8)}`;

  return {
    type: 1, // DATA
    from,
    to,
    ts,
    gatewayId: "gw-1a",
    connId: "c-77f0d2",
    tenantId: "tenant_001",
    appId: "im_app",
    qos: 1,
    priority: 0,
    ackRequired: true,
    ackId: `ack-${clientMsgId}`,
    dedupId: clientMsgId,
    nonce: Math.random().toString(36).slice(2, 12),
    expiresAt,
    payload: {
      clientMsgId,
      serverMsgId: "",
      createTime: ts,
      sendTime: ts,
      sessionType: 1, // 私聊
      sendId: from,
      recvId: to,
      msgFrom: 1, // 用户
      contentType: 101, // TEXT
      senderPlatformId: 5, // WEB
      senderNickname: "Alice",
      senderFaceUrl: "https://cdn.example.com/avatar/alice.png",
      seq: Math.floor(Math.random() * 10000).toString(),
      isRead: false,
      status: 0,
      textElem: {
        content, // 👈 这里传进来的内容
      },
    },
  };
}
