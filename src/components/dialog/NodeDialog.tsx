import { getJSON, handleInputChange, postJSON } from '../../utils'
import { openPrompt } from './BaseDialog'
import { Toast } from '../Toast'

export default async function promptNode(cfg: any) {
  let child: any = {}
  let defaultValue: any = {}
  const topic_cfg = await getJSON("/get_ros_param/mavproxy/other/node_cfg")?.then((res: any) => res["msg"])
  const childCfg = await Promise.all(topic_cfg.map(({ topic, title, type }: any) => {
    return getJSON(`/get_ros_param${topic}`)?.then(res => {
      const value = res["status"] == "error" ? undefined : res["msg"]
      return { value, topic, title, type }
    })
  }))
  const _c: Record<string, any> = {}
  childCfg.filter(v => (!!v && v.value != undefined)).forEach(({ value, topic, title, type }: any) => {
    defaultValue = { ...defaultValue, [topic]: value }
    const func_map = {
      "boolean": (value1: boolean, onChange: any) => (
        <label className="label min-w-xs max-w-full">
          <input type="checkbox" checked={value1} onChange={(e) => onChange(e.target.checked)} className="toggle" />
          {title}
        </label>
      ),
      "number": (value1: number, onChange: any) => (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">{title}</legend>
          <input type="text" value={value1} onChange={(e) => handleInputChange(e, onChange)} className="input" />
        </fieldset>
      ),
      "string": (value1: string, onChange: any) => (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">{title}</legend>
          <input type="text" value={value1} onChange={(e) => onChange(e.target.value)} className="input" />
        </fieldset>
      )
    }
    _c[topic] = func_map[type as "string" | "number" | "boolean"]
  })
  child = _c

  console.log(defaultValue)
  openPrompt({
    ...cfg,
    defaultValue,
    children: child
  }).then(res => Promise.all(
    topic_cfg.map(({ topic, type }: any) => {
      let value = res[topic]
      if (type == "number") {
        let float = Number(value)
        if (Number.isNaN(float)) {
          throw Error(`${value} is not a valid number`)
        }
        value = float
      }
      postJSON(`/set_ros_param`, { name: topic, value })
    })
  ).then(() => Toast.info("OK"), (res: any) => Toast.error(res)))
}