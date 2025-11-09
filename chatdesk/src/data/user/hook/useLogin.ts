import { useState, useCallback } from "react";
import { request, setHttpTokenGetter } from "@/net/lib/http";
import type { LoginRequest, LoginResponse } from "@/data/user/req/auth";

const TOKEN_KEY = "authorization";
const TOKEN_HASH_KEY = "authorizationHash";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<LoginResponse | null>(null);

  const login = useCallback(async (payload: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await request<LoginResponse>("/login", {
        method: "POST",
        body: payload,
      });

      if (resp.access_token) {
        localStorage.setItem(TOKEN_KEY, resp.access_token);
        localStorage.setItem(TOKEN_HASH_KEY, resp.access_token_hash ?? "");

        // ✅ 同时注册 token + hash getter
        setHttpTokenGetter(
          () => localStorage.getItem(TOKEN_KEY),
          () => localStorage.getItem(TOKEN_HASH_KEY)
        );
      }

      setData(resp);
      return resp;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error, data };
}
