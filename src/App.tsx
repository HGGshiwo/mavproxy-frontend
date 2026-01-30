import { useEffect } from "react"
import Button from "./components/Button"
import { useWS } from "./hooks/useWs"
import prompt from "./components/dialog/PromptDialog"
import { postJSON, getJSON, sendWp, setMode, parseURL, copyToClipboard } from "./utils"
import { Toast, ToastContainer } from "./components/Toast"
import State from "./components/State"
import WpTable from "./components/tab/TabWp"
import { showPipVideo } from "./components/Video"
import { openParamsModal } from "./components/ParamModal"
import TabEvent from "./components/tab/TabEvent"
import promptNode from "./components/dialog/NodeDialog"
import { takeoff } from "./utils"
import promptGimbal from "./components/dialog/GimbalDialog"
import promptDetect from "./components/dialog/DetectDialog"
import promptExposure from "./components/dialog/ExposureDialog"

function App() {
  const { send, connect } = useWS()
  useEffect(() => {
    connect('/ws')
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面变为可见，重新连接
        connect('/ws');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [])


  const buttonConfig = [
    { click: () => prompt({ message: "输入地面站命令" }).then(res => send(res)), text: "地面站命令" },
    { click: () => prompt({ message: "输入起飞高度" }).then(alt => takeoff(alt)), text: "起飞" },
    { click: () => setMode('RTL'), text: "返航" },
    { click: () => setMode('LAND'), text: "降落" },
    { click: () => prompt({ message: "输入航点(要求加起飞点)" }).then(res => sendWp(res, "return")), text: "返航(可加航点)" },
    { click: () => prompt({ message: "输入航点(要求加起飞点)" }).then(res => sendWp(res, "land")), text: "降落(可加航点)" },
    { click: () => prompt({ message: "输入航点(要求加起飞点)" }).then(res => sendWp(res, "set_waypoint")), text: "设置航点" },
    { click: () => getJSON("/get_waypoint")?.then(({ msg }: any) => { copyToClipboard(JSON.stringify(msg)); Toast.info("已拷贝到剪贴板") }), text: "获取航点" },
    { click: () => setMode('LOITER'), text: "悬停" },
    { click: () => setMode('GUIDED'), text: "guided" },
    { click: () => postJSON(`/arm`, {}, true), text: "解锁" },
    { click: () => getJSON("/prearms", true), text: "检查起飞状态" },
    { click: () => postJSON("/stop_follow", {}, true), text: "停止跟随" },
    { click: () => prompt({ message: "输入前缀" }).then(res => res && postJSON("/start_record", { bag_name: res }, true)), text: "开始录制" },
    { click: () => postJSON("/stop_record", {}, true), text: "结束录制" },
    { click: () => openParamsModal(), text: "设置参数" },
    { click: () => prompt({ message: "拉流地址" }).then(res => res && showPipVideo({ src: parseURL(`/${res}`), type: "image" })), text: "开始拉流" },
    { click: () => promptNode({ message: "节点控制" }), text: "节点控制" },
    { click: () => getJSON("/get_gps")?.then(({ msg }: any) => { copyToClipboard(msg); Toast.info("已拷贝到剪贴板") }), text: "获取GPS" },
    { click: () => getJSON("/get_gpsv2")?.then(({ msg }: any) => { copyToClipboard(JSON.stringify(msg)); Toast.info("已拷贝到剪贴板") }), text: "获取GPSv2" },
    { click: () => prompt({ message: "输入模式" }).then(res => res && postJSON("/set_mode", { mode: res }, true)), text: "设置模式" },
    { click: () => promptGimbal({ message: "云台控制" }), text: "云台控制" },
    { click: () => promptDetect({ message: "检测控制" }), text: "开始检测" },
    { click: () => postJSON("/stop_detect", {}, true), text: "停止检测" },
    { click: () => postJSON("/start_planner", {}, true), text: "启动避障" },
    { click: () => postJSON("/stop_planner", {}, true), text: "关闭避障" },
    { click: () => postJSON("/reboot_fcu", {}, true), text: "重启飞控" },
    { click: () => promptExposure({ message: "相机控制" }), text: "相机控制" },
  ]
  const getIdx = (data: any) => {
    if (data.type == "event" && data.event == "progress") {
      return data.cur
    }
    else if(data.type == "state" && data.wp_idx != undefined) {
      return data.wp_idx
    }
    return undefined
  }
  const tabConfig = [
    { comp: <WpTable getData={(data: any) => data.mission_data} getIdx={getIdx} />, name: "航点数据" },
    { comp: <TabEvent />, name: "事件浏览" },
    { comp: <WpTable getData={(data: any) => data.waypoint?.map((item: any) => ({ lon: item[0], lat: item[1], alt: item[2] }))} />, name: "避障航点" }
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
