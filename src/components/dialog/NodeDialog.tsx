import { useEffect, useState } from 'react'
import { getJSON } from '../../utils'
import { openPrompt } from './BaseDialog'


const topic_cfg = [
  { topic: "/UAV0/sensor/video11_camera/enable_send", title: "相机" },
  { topic: "/UAV0/perception/yolo_detection/enable_detection", title: "检测" }
]

export default function promptNode(cfg: any) {
  const [child, setChild] = useState({})

  useEffect(() => {
    const func = (title: string, topic: string) => {
      Promise.all(topic_cfg.map(({ topic, title }) => {
        return getJSON(`/get_ros_param/${topic}`)?.then(res => {
          return { value: res.value, topic, title }
        })
      })).then(res => {
        setChild(res.filter(v => !!v).map(({ value, topic, title }) => {
          return (value1: boolean, onChange: any) => (
            <label className="label">
              <input type="checkbox" defaultChecked={value} checked={value1} onChange={onChange} className="toggle" />
              {title}
            </label>
          )
        }))
      })

    }
  }, [])


  return openPrompt({
    ...cfg,
    children: child
  })
    .then(res => res["input"])
}