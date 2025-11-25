import { useEffect } from "react"
import Button from "./components/Button"
import { useWS } from "./hooks/useWs"
import { prompt } from "./components/PromptDialog"
import { postJSON, getJSON, sendWp, setMode } from "./utils"
import { Toast, ToastContainer } from "./components/Toast"
import State from "./components/State"
import WpTable from "./components/WpTable"


function App() {
  const { send, connect } = useWS()
  useEffect(() => {
    connect('/ws')
  }, [])


  const buttonConfig = [
    // { click: () => prompt({ message: "输入地面站命令" }).then(res => send(res)), text: "地面站命令" },
    { click: () => setMode('RTL'), text: "返航" },
    { click: () => setMode('LAND'), text: "降落" },
    { click: () => prompt({ message: "输入航点" }).then(res => sendWp(res, "return")), text: "返航(可加航点)" },
    { click: () => prompt({ message: "输入航点" }).then(res => sendWp(res, "land")), text: "降落(可加航点)" },
    { click: () => setMode('LOITER'), text: "悬停" },
    { click: () => setMode('GUIDED'), text: "guided" },
    { click: () => getJSON("/prearms").then(res=>Toast.info(res.msg)), text: "检查起飞状态" },
    { click: () => postJSON("/start_record").then(res=>Toast.info(res.msg)), text: "开始录制" },
    { click: () => postJSON("/stop_record").then(res=>Toast.info(res.msg)), text: "结束录制" },
  ]
  return (
    <>
      <ToastContainer />
      <div className="p-4">
        <div className="mb-4">
          <State />
        </div>
        <div className="flex gap-4 flex-wrap items-center">
          {buttonConfig.map(({ click, text }) => (
            <Button onClick={click}>{text}</Button>
          ))}
        </div>
        <div className="p-4">
          <WpTable />
        </div>
          
      </div>
    </>
  )
}

export default App
