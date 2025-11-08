// WSContext.tsx
import React from "react";
import { useWS } from "./useWS"; // 你已有的那个，用来真的 new WebSocket

type WSContextValue<T = any> = {
    ws: ReturnType<typeof useWS<T>>;
};

const WSContext = React.createContext<WSContextValue | null>(null);

export const WSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 👇 这里就真的 new 一次，整个应用只会执行这一回
    const ws = useWS({
        key: "ws:/chat",
        url: "ws://localhost:8080/chat?user=B",
        options: {
            autoReconnect: true,
            reconnectBaseDelay: 800,
            reconnectMaxDelay: 8000,
        },
        parse: (raw) => {
            if (typeof raw === "string") {
                try {
                    return JSON.parse(raw);
                } catch {
                    return { type: "text", payload: raw };
                }
            }
            return { type: "unknown", payload: String(raw) };
        },
    });

    return (
        <WSContext.Provider value={{ ws }}>
            {children}
        </WSContext.Provider>
    );
};

// 下面这个就是所有 view 要用的：拿“同一条 socket”
export function useWSConn<T = any>() {
    const ctx = React.useContext(WSContext);
    if (!ctx) {
        throw new Error("useWSConn must be used inside <WSProvider />");
    }
    return ctx.ws as ReturnType<typeof useWS<T>>;
}
