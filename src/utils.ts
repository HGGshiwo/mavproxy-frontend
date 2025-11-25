import { Toast } from "./components/Toast";

function parseURL(url: string) {
  if (import.meta.env.MODE === 'development') {
    url = `http://localhost:8000${url}`
  } else if (import.meta.env.MODE === 'production') {
    // 生产环境
  }
  return url
}

function postJSON(url: string, data: any = {}) {
  url = parseURL(url)
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Specify the content type as JSON
    },
    body: JSON.stringify(data), // Convert the data object to a JSON string
  };

  return fetch(url, options).then(res => res.json());
};

function getJSON(url: string) {
  url = parseURL(url)
  return fetch(url).then(res => res.json())
}

const handleRes = (res: any) => {
  let data;
  const toast = res["status"] === "error" ? Toast.error : Toast.info
  if (res["detail"] != undefined) {
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

let setMode = (mode: string) => {
  postJSON(`/set_mode`, { mode })
    .then(handleRes, err => Toast.error(err))
}

function sendWp(wp: string | null, type: "return" | "land") {
  if (wp == null) return;
  wp = wp.replace(/[^0-9\[\]\,\.]/g, "");
  postJSON(`/${type}`, { waypoint: JSON.parse(wp) })
    .then(handleRes, err => Toast.error(err))
}

export { setMode, postJSON, getJSON, sendWp }