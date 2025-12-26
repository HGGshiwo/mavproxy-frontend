import { Toast } from "./components/Toast";
// const base_url = "localhost:8000"
const base_url = "192.168.1.198:8000"

export function parseURL(url: string, ws = false) {
  if (import.meta.env.MODE === 'development') {
    const protocal = ws ? "ws" : "http"
    url = `${protocal}://${base_url}${url}`
  } else if (import.meta.env.MODE === 'production') {
    // 生产环境
    const protocal = ws ? "ws" : "http"
    url = `${protocal}://${window.location.host}${url}`
  }
  return url
}

export function postJSON(url: string, data: any = {}, verbose = false) {
  url = parseURL(url)
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Specify the content type as JSON
    },
    body: JSON.stringify(data), // Convert the data object to a JSON string
  };

  const res = fetch(url, options).then(res => res.json());
  if (!verbose) return res
  res.then(handleRes, err => Toast.error(err))
};

export function getJSON(url: string, verbose = false) {
  url = parseURL(url)
  const res = fetch(url).then(res => res.json())
  if (!verbose) return res
  res.then(handleRes, err => Toast.error(err))
}

const handleRes = (res: any) => {
  let data;
  const toast = res["status"] === "success" ? Toast.info : Toast.error
  if (res["detail"]) {
    data = res["detail"]
  }
  else {
    data = res["msg"]
  }
  if (typeof data != "string") {
    data = JSON.stringify(data)
  }
  toast(data)
}

export function setMode(mode: string) {
  postJSON(`/set_mode`, { mode }, true)
}

export function sendWp(wp: string | null, type: "return" | "land" | "set_waypoint") {
  if (wp == null) return;
  wp = wp.replace(/[^0-9\[\]\,\.-]/g, "");
  postJSON(`/${type}`, { waypoint: JSON.parse(wp) }, true)
}

export function takeoff(altStr: string) {
  let alt = parseFloat(altStr)
  if (Number.isNaN(alt)) {
    Toast.error("输入非数字")
    return
  }
  else {
    postJSON('/takeoff', { alt }, true)
  }
}

export function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    // 兼容旧浏览器
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve();
    } catch (err) {
      document.body.removeChild(textarea);
      return Promise.reject(err);
    }
  }
}

export const handleInputChange = (e: any, setInputValue: any) => {
  const value = e.target.value;
  // 保留纯负号
  if (value === '-') {
    setInputValue('-');
    return;
  }
  // 优化：避免步进时出现 "-0"（可选）
  if (value === '-0') {
    setInputValue('0');
    return;
  }
  setInputValue(value);
};