import { useEffect, useState } from "react"
import { useWS } from "../hooks/useWs"

const keyMap: Record<string, any> = {
  "connected": {
    name: "连接状态",
    value: (v: boolean) => v ? "已连接" : "断开"
  },
  "link_down": {
    name: "连接状态",
    value: (v: boolean) => v ? "断开" : "已连接"
  },
  "arm": {
    name: "解锁",
    value: (v: number) => v > 0 ? "已解锁" : "未解锁"
  },
  "rel_alt": {
    name: "相对高度",
    value: (v: number) => v.toFixed(2)
  }
}

const priorityOrder = ['connected', "link_down", "arm", "mode", "rel_alt",];
const exclude = ["radio_noise", "radio_remnoise", "radio_rssi", "type", "radio_error", "mission_data", "mission_num",
  "vehicle_agl", "wp_total", "wp_cur", "wp_bearing", "wp_distance", "wp_etr", "link_lost", "link_count", "compid",
  "gps2_error", "gps2_fix_type", "gps2_hdop", "gps2_nsats", "lat", "lon", "sysid", "ekf_error", "error", "flight_time",
  "gps_error", "params_receive", "params_total", "aspd_error", "alt_error", "battery_remain", "battery_voltage", "agl_alt",
  "wind_direction", "wind_speed", "throttle", "air_speed", "event", "vfr_hud_heading", "waypoint"
]

const mySort = (arr: any[]) => arr.sort((a, b) => {
  const indexA = priorityOrder.indexOf(a);
  const indexB = priorityOrder.indexOf(b);

  if (indexA !== -1 && indexB !== -1) {
    // 都在指定顺序里，按指定顺序排列
    return indexA - indexB;
  } else if (indexA !== -1) {
    // a在指定顺序里，b不在，a排前
    return -1;
  } else if (indexB !== -1) {
    // b在指定顺序里，a不在，b排前
    return 1;
  } else {
    // 都不在指定顺序里，按字母排序
    return a.localeCompare(b);
  }
});

export default function State() {
  const DEFAULT_STATE = { connected: false }
  const [state, setState] = useState<Record<string, any>>(DEFAULT_STATE)
  // setState({conncected: false})
  const { onMessage, onClose } = useWS()
  useEffect(() => {
    onMessage((data) => {
      if(data.type != "state") return
      setState(prev => {
        if (data.link_down != undefined) {
          delete prev["connected"]
        }
        return { ...prev, ...data }
      })
    })

    onClose(()=>{
      setState(DEFAULT_STATE)
    })
  }, [])

  return (
    <div className="stats shadow flex flex-row bg-base-100 rounded-lg p-4 flex-wrap">
      {mySort(Object.keys(state).filter(k => !exclude.includes(k))).map(key => {
        const kv = keyMap[key]
        let value = state[key]
        if (kv) {
          key = kv.name
          value = kv.value(value)
        }
        else {
          if (typeof value == "number") {
            value = value.toFixed(2)
          }
          else if (Array.isArray(value) && value.length == 0) {
            value = "No Data"
          }
          else if (value == null) {
            value = "No Data"
          }
          else {
            value = value.toString()
          }
        }
        return (
          <div className="stat w-fit">
            <div className="stat-title">{key}</div>
            <div className="stat-value" style={{ fontSize: "1.5rem" }}>{value}</div>
          </div>
        )
      })}
    </div>
  )
}