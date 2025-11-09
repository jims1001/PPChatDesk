const TOKEN_KEY = "authorization";
const TOKEN_HASH_KEY = "authorizationHash";

export function useGetToken() {
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getTokenHash = () => localStorage.getItem(TOKEN_HASH_KEY);
  const setToken = (token: string | null, hash?: string | null) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    if (hash) localStorage.setItem(TOKEN_HASH_KEY, hash);
    else localStorage.removeItem(TOKEN_HASH_KEY);
  };
  return { getToken, getTokenHash, setToken };
}
