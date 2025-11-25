import { useEffect, useState } from "react"
import { useWS } from "../hooks/useWs"

const keyMap: Record<string, any> = {
  "connected": {
    name: "连接状态",
    value: (v: boolean) => v ? "连接" : "断开"
  }
}

const priorityOrder = ['connecetd'];

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
  const [state, setState] = useState<Record<string, any>>({
    "connected": false
  })
  const { onMessage } = useWS()
  useEffect(() => {
    onMessage((event) => {
      setState({ ...state, ...event.data })
    })
  }, [])

  return (
    <div className="stats shadow flex flex-row w-full bg-base-100 rounded-lg p-4">
      {mySort(Object.keys(state)).map(key => {
        const kv = keyMap[key]
        let value = state[key]
        if (kv) {
          key = kv.name
          value = kv.value(value)
        }
        else {
          value = typeof value == "number" ? value.toFixed(2) : value.toString()
        }
        return (
          <div className="stat">
            <div className="stat-title">{key}</div>
            <div className="stat-value">{value}</div>
          </div>
        )
      })}
    </div>
  )
}