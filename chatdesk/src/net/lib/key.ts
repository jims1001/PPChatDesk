// 统一的 Key 工厂，避免魔法字符串散落
// 约定：key = `${method}:${path}?${stableParams}`

function stableStringify(obj: any): any {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
}

export function makeKey(
  method: string,
  path: string,
  params?: Record<string, any>
) {
  const p = params ? stableStringify(params) : "";
  return `${method.toUpperCase()}:${path}${p ? `?${p}` : ""}`;
}

// 常见集合
export const Key = {
  users: (params?: { q?: string; page?: number; pageSize?: number }) =>
    makeKey("GET", "/api/users", params),
  userDetail: (id: string | number) => makeKey("GET", `/api/users/${id}`),
  postsInfinite: (cursor?: string, pageSize = 20) =>
    makeKey("GET", "/api/posts", { cursor, pageSize }),
};
