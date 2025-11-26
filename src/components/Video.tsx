// PipVideo.tsx
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Toast } from "./Toast";

export interface PipVideoProps {
  type?: "video" | "image";
  src?: string;
  srcObj?: MediaStream;
  onClose?: () => void;
  minWidth?: number;
  minHeight?: number;
  width?: number;
  height?: number;
}

let pipRoot: ReactDOM.Root | null = null;

const PipVideo: React.FC<PipVideoProps> = ({
  type = "video",
  src,
  srcObj,
  onClose,
  minWidth = 200,
  minHeight = 120,
  width = 320,
  height = 180,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<{
    left: number | null;
    top: number | null;
    right: number;
    bottom: number;
  }>({
    left: null,
    top: null,
    right: 32,
    bottom: 32,
  });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width,
    height,
  });
  const draggingRef = useRef(false);
  const resizingRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({
    x: 0,
    y: 0,
    w: width,
    h: height,
  });

  // 视频加载事件
  useEffect(() => {
    if (type !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    const handleLoaded = () => setLoading(false);
    const handleError = () => {
      const error = video.error;
      const errorMap: any = {
        [error!.MEDIA_ERR_ABORTED]: "视频加载被用户终止",
        [error!.MEDIA_ERR_NETWORK]: "网络错误，无法加载视频",
        [error!.MEDIA_ERR_DECODE]: "视频解码错误或文件损坏",
        [error!.MEDIA_ERR_SRC_NOT_SUPPORTED]: "视频格式不受支持或找不到视频文件",
      };
      Toast.error(
        video.error?.message ||
          (errorMap[error!.code] && `播放错误: ${errorMap[error!.code]}`) ||
          "未知错误"
      );
      handleClose();
    };
    video.addEventListener("canplay", handleLoaded);
    video.addEventListener("error", handleError);
    return () => {
      video.removeEventListener("canplay", handleLoaded);
      video.removeEventListener("error", handleError);
    };
  }, [type, src, srcObj]);

  // 设置视频源
  useEffect(() => {
    if (type !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    if (srcObj) {
      video.srcObject = srcObj;
    } else if (src) {
      video.src = src;
    }
  }, [type, src, srcObj]);

  // 图片加载事件
  useEffect(() => {
    if (type !== "image") return;
    setLoading(true);
    const img = new window.Image();
    img.src = src || "";
    img.onload = () => setLoading(false);
    img.onerror = () => {
      Toast.error("图片加载失败");
      setLoading(false);
      handleClose();
    };
  }, [type, src]);

  // 拖拽
  function getEventXY(e: MouseEvent | TouchEvent): { x: number; y: number } {
    if ((e as TouchEvent).touches && (e as TouchEvent).touches.length) {
      return {
        x: (e as TouchEvent).touches[0].clientX,
        y: (e as TouchEvent).touches[0].clientY,
      };
    } else if (
      (e as TouchEvent).changedTouches &&
      (e as TouchEvent).changedTouches.length
    ) {
      return {
        x: (e as TouchEvent).changedTouches[0].clientX,
        y: (e as TouchEvent).changedTouches[0].clientY,
      };
    } else {
      return {
        x: (e as MouseEvent).clientX,
        y: (e as MouseEvent).clientY,
      };
    }
  }

  useEffect(() => {
    function onDown(e: MouseEvent | TouchEvent) {
      if (
        (e.target as HTMLElement)?.closest(".pip-close-btn") ||
        (e.target as HTMLElement)?.closest(".pip-resize-handle")
      )
        return;
      draggingRef.current = true;
      const rect = containerRef.current!.getBoundingClientRect();
      const { x, y } = getEventXY(e);
      dragOffset.current = { x: x - rect.left, y: y - rect.top };
      document.body.style.userSelect = "none";
      if ((e as TouchEvent).type?.startsWith("touch")) e.preventDefault();
    }
    function onMove(e: MouseEvent | TouchEvent) {
      if (!draggingRef.current) return;
      const { x, y } = getEventXY(e);
      let newLeft = x - dragOffset.current.x;
      let newTop = y - dragOffset.current.y;
      const winW = window.innerWidth,
        winH = window.innerHeight;
      const pipW = containerRef.current!.offsetWidth,
        pipH = containerRef.current!.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, winW - pipW));
      newTop = Math.max(0, Math.min(newTop, winH - pipH));
      setPosition({
        left: newLeft,
        top: newTop,
        right: null as any,
        bottom: null as any,
      });
      if ((e as TouchEvent).type?.startsWith("touch")) e.preventDefault();
    }
    function onUp(e: MouseEvent | TouchEvent) {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.userSelect = "";
      if (e && (e as TouchEvent).type?.startsWith("touch")) e.preventDefault();
    }
    const node = containerRef.current;
    if (!node) return;
    node.addEventListener("mousedown", onDown as any);
    node.addEventListener("touchstart", onDown as any, { passive: false });
    document.addEventListener("mousemove", onMove as any);
    document.addEventListener("touchmove", onMove as any, { passive: false });
    document.addEventListener("mouseup", onUp as any);
    document.addEventListener("touchend", onUp as any, { passive: false });
    return () => {
      node.removeEventListener("mousedown", onDown as any);
      node.removeEventListener("touchstart", onDown as any);
      document.removeEventListener("mousemove", onMove as any);
      document.removeEventListener("touchmove", onMove as any);
      document.removeEventListener("mouseup", onUp as any);
      document.removeEventListener("touchend", onUp as any);
    };
  }, []);

  // 缩放
  useEffect(() => {
    function onResizeStart(e: MouseEvent | TouchEvent) {
      resizingRef.current = true;
      const { x, y } = getEventXY(e);
      resizeStart.current = {
        x,
        y,
        w: containerRef.current!.offsetWidth,
        h: contentRef.current!.offsetHeight,
      };
      document.body.style.userSelect = "none";
      e.preventDefault();
      e.stopPropagation();
    }
    function onResizeMove(e: MouseEvent | TouchEvent) {
      if (!resizingRef.current) return;
      const { x, y } = getEventXY(e);
      let newW = resizeStart.current.w + (x - resizeStart.current.x);
      let newH = resizeStart.current.h + (y - resizeStart.current.y);
      newW = Math.max(minWidth, Math.min(newW, window.innerWidth));
      newH = Math.max(minHeight, Math.min(newH, window.innerHeight));
      setSize({ width: newW, height: newH });
      if ((e as TouchEvent).type?.startsWith("touch")) e.preventDefault();
    }
    function onResizeEnd(e: MouseEvent | TouchEvent) {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      document.body.style.userSelect = "";
      if (e && (e as TouchEvent).type?.startsWith("touch")) e.preventDefault();
    }
    const handle = document.getElementById("pip-resize-handle");
    if (!handle) return;
    handle.addEventListener("mousedown", onResizeStart as any);
    handle.addEventListener("touchstart", onResizeStart as any, {
      passive: false,
    });
    document.addEventListener("mousemove", onResizeMove as any);
    document.addEventListener("touchmove", onResizeMove as any, {
      passive: false,
    });
    document.addEventListener("mouseup", onResizeEnd as any);
    document.addEventListener("touchend", onResizeEnd as any, {
      passive: false,
    });
    return () => {
      handle.removeEventListener("mousedown", onResizeStart as any);
      handle.removeEventListener("touchstart", onResizeStart as any);
      document.removeEventListener("mousemove", onResizeMove as any);
      document.removeEventListener("touchmove", onResizeMove as any);
      document.removeEventListener("mouseup", onResizeEnd as any);
      document.removeEventListener("touchend", onResizeEnd as any);
    };
  }, []);

  // 关闭
  function handleClose() {
    onClose && onClose();
    if (pipRoot) {
      pipRoot.unmount();
      pipRoot = null;
    }
    const rootDiv = document.getElementById("pip-root");
    if (rootDiv) rootDiv.remove();
  }

  // 样式
  const containerStyle: any = {
    position: "fixed",
    zIndex: 1000,
    width: size.width,
    minWidth,
    padding: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    borderRadius: "0.5rem",
    ...(position.left !== null
      ? {
          left: position.left,
          top: position.top,
          right: "auto",
          bottom: "auto",
        }
      : {
          right: position.right,
          bottom: position.bottom,
        }),
    background: "#fff",
  };

  return (
    <div
      ref={containerRef}
      className="shadow-lg border border-base-200"
      style={containerStyle}
    >
      {/* 标题栏 */}
      <div
        className="flex items-center justify-end bg-base-100 border-b border-base-200 cursor-move rounded-t"
        style={{ padding: "0.5rem" }}
      >
        <button
          className="pip-close-btn btn btn-xs btn-ghost btn-circle"
          aria-label="关闭"
          onClick={handleClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="7 13 13 7" />
            <polyline points="13 13 7 7" />
          </svg>
        </button>
      </div>
      {/* 内容区 */}
      <div
        ref={contentRef}
        className="relative bg-black rounded-b"
        style={{
          width: "100%",
          height: size.height,
          minHeight,
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}
        {type === "video" ? (
          <video
            ref={videoRef}
            className="w-full h-full rounded-b"
            autoPlay
            muted
            playsInline
            style={{
              display: "block",
              background: "#000",
            }}
            controls
          />
        ) : (
          <img
            src={src}
            className="w-full h-full object-contain rounded-b"
            alt="pip-img"
            style={{
              display: "block",
              background: "#000",
              width: "100%",
              height: "100%",
              minHeight,
            }}
          />
        )}
        {/* 缩放手柄 */}
        <span
          id="pip-resize-handle"
          className="pip-resize-handle absolute right-2 bottom-2 cursor-se-resize z-30"
        >
          <svg width="20" height="20" viewBox="0 0 16 16">
            <polyline
              points="4,12 12,12 12,4"
              fill="none"
              stroke="gray"
              strokeWidth="2"
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

export function showPipVideo(props: PipVideoProps) {
  let oldDiv = document.getElementById("pip-root");
  if (pipRoot) {
    pipRoot.unmount();
    pipRoot = null;
  }
  if (oldDiv) oldDiv.remove();

  const div = document.createElement("div");
  div.id = "pip-root";
  document.body.appendChild(div);

  pipRoot = ReactDOM.createRoot(div);
  pipRoot.render(<PipVideo {...props} />);
}

export default PipVideo;
