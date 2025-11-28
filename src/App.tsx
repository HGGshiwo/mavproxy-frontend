import { useEffect } from "react"
import Button from "./components/Button"
import { useWS } from "./hooks/useWs"
import prompt from "./components/dialog/PromptDialog"
import { postJSON, getJSON, sendWp, setMode, parseURL } from "./utils"
import { ToastContainer } from "./components/Toast"
import State from "./components/State"
import WpTable from "./components/tab/TabWp"
import { showPipVideo } from "./components/Video"
import { openParamsModal } from "./components/ParamModal"
import TabEvent from "./components/tab/TabEvent"
import promptNode from "./components/dialog/NodeDialog"
import { takeoff } from "./utils"

function App() {
  const { send, connect } = useWS()
  useEffect(() => {
    connect('/ws')
  }, [])


  const buttonConfig = [
    { click: () => prompt({ message: "输入地面站命令" }).then(res => send(res)), text: "地面站命令" },
    { click: () => prompt({ message: "输入起飞高度" }).then(alt => takeoff(alt)), text: "起飞" },
    { click: () => setMode('RTL'), text: "返航" },
    { click: () => setMode('LAND'), text: "降落" },
    { click: () => prompt({ message: "输入航点" }).then(res => sendWp(res, "return")), text: "返航(可加航点)" },
    { click: () => prompt({ message: "输入航点" }).then(res => sendWp(res, "land")), text: "降落(可加航点)" },
    { click: () => setMode('LOITER'), text: "悬停" },
    { click: () => setMode('GUIDED'), text: "guided" },
    { click: () => postJSON(`/arm`, {}, true), text: "解锁" },
    { click: () => getJSON("/prearms", true), text: "检查起飞状态" },
    { click: () => postJSON("/stop_follow", {}, true), text: "停止跟随" },
    { click: () => prompt({ message: "输入前缀" }).then(res => res && postJSON("/start_record", { bag_name: res }, true)), text: "开始录制" },
    { click: () => postJSON("/stop_record", {}, true), text: "结束录制" },
    { click: () => openParamsModal(), text: "设置参数" },
    { click: () => prompt({ message: "拉流地址" }).then(res => res && showPipVideo({ src: parseURL(`/${res}`), type: "image" })), text: "开始拉流" },
    { click: () => promptNode({ message: "节点控制" }), text: "节点控制" }
  ]

  const tabConfig = [
    { comp: <WpTable />, name: "航点数据" },
    { comp: <TabEvent />, name: "事件浏览" }
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
        <div className="p-8">
          <div className="tabs tabs-border">
            {tabConfig.map(({ comp, name }, i) => {
              return (
                <>
                  <input type="radio" name="my_tabs_2" className="tab text-xl" aria-label={name} defaultChecked={i == 0} />
                  <div className="tab-content border-base-300 bg-base-100 p-10">
                    {comp}
                  </div>
                </>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
