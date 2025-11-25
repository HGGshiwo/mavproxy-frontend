import React, { useEffect, useRef, useState } from "react";

// ToastManager.ts
export type ToastType = "info" | "success" | "error" | "warning";

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

type ToastListener = (msg: ToastMessage) => void;

class ToastManager {
  private static _instance: ToastManager;
  private listeners: ToastListener[] = [];
  private id = 0;

  static get instance() {
    if (!ToastManager._instance) {
      ToastManager._instance = new ToastManager();
    }
    return ToastManager._instance;
  }

  subscribe(listener: ToastListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(type: ToastType, message: string, duration = 3000) {
    const msg: ToastMessage = {
      id: ++this.id,
      type,
      message,
      duration,
    };
    this.listeners.forEach(fn => fn(msg));
  }
}




const iconMap: Record<ToastType, React.ReactNode> = {
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
    </svg>
  ),
};

const styleMap: Record<ToastType, React.CSSProperties> = {
  info:    { background: "#e0f2fe", color: "#0369a1", borderLeft: "4px solid #38bdf8" },
  success: { background: "#dcfce7", color: "#15803d", borderLeft: "4px solid #22c55e" },
  error:   { background: "#fee2e2", color: "#b91c1c", borderLeft: "4px solid #ef4444" },
  warning: { background: "#fef9c3", color: "#b45309", borderLeft: "4px solid #facc15" },
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Record<number, number>>({});

  useEffect(() => {
    const unsubscribe = ToastManager.instance.subscribe((msg) => {
      setToasts((prev) => [...prev, msg]);
      timers.current[msg.id] = setTimeout(() => {
        setToasts((prev) => prev.filter(t => t.id !== msg.id));
        delete timers.current[msg.id];
      }, msg.duration);
    });
    return () => {
      unsubscribe();
      // 清理所有定时器
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 6,
            minWidth: 240,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            fontWeight: 500,
            fontSize: "1rem",
            ...styleMap[toast.type]
          }}
        >
          {iconMap[toast.type]}
          <span style={{whiteSpace: 'pre-line'}}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};


type ToastFunc = (msg: string, duration?: number) => void;

export const Toast: Record<ToastType, ToastFunc> = {
  info:    (msg, duration) => ToastManager.instance.notify("info", msg, duration),
  success: (msg, duration) => ToastManager.instance.notify("success", msg, duration),
  error:   (msg, duration) => ToastManager.instance.notify("error", msg, duration),
  warning: (msg, duration) => ToastManager.instance.notify("warning", msg, duration),
};
