import { useRef } from 'react';

type EventCallback<T> = (event: T) => void;


// 全局单例
let wsInstance: WebSocket | null = null;
let messageCallbacks: EventCallback<MessageEvent>[] = [];
let closeCallbacks: EventCallback<CloseEvent>[] = [];

// 连接
function connect(url: string): void {
  if (wsInstance) {
    wsInstance.close();
  }
  wsInstance = new window.WebSocket(url);

  wsInstance.onmessage = (event: MessageEvent) => {
    messageCallbacks.forEach(cb => cb(event));
  };

  wsInstance.onclose = (event: CloseEvent) => {
    closeCallbacks.forEach(cb => cb(event))
  }
}

// 关闭
function close(): void {
  if (wsInstance) {
    wsInstance.close();
    wsInstance = null;
  }
}

// 注册 message 回调
function onMessage(cb: EventCallback<MessageEvent>): () => void {
  messageCallbacks.push(cb);
  // 返回取消注册函数
  return () => {
    messageCallbacks = messageCallbacks.filter(fn => fn !== cb);
  };
}

function onClose(cb: EventCallback<CloseEvent>): () => void {
  closeCallbacks.push(cb);
  // 返回取消注册函数
  return () => {
    closeCallbacks = closeCallbacks.filter(fn => fn !== cb);
  };
}

function sendMessage(data: any) {
    wsInstance && wsInstance.send(data)
}

// Hook 返回同一个实例
export function useWS() {
  // 用 useRef 保证返回的是稳定引用
  const connectRef = useRef(connect);
  const closeRef = useRef(close);
  const onMessageRef = useRef(onMessage);
  const sendRef = useRef(sendMessage);
  const onCloseRef = useRef(onClose)

  return {
    connect: connectRef.current,
    close: closeRef.current,
    onMessage: onMessageRef.current,
    onClose: onCloseRef.current,
    send: sendRef.current 
  };
}
