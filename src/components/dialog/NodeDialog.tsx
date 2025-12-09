import { getJSON, postJSON } from '../../utils'
import { openPrompt } from './BaseDialog'
import { Toast } from '../Toast'

export default async function promptNode(cfg: any) {
  let child: any = {}
  let defaultValue: any = {}

  return getJSON("/get_ros_param/mavproxy/other/node_cfg")?.then((res: any) => res["msg"])
    .then(async (topic_cfg: any[]) => {
      const childCfg = await Promise.all(topic_cfg.map(({ topic, title, type }) => {
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
              <input type="number" value={value1} onChange={(e) => onChange(e.target.value)} className="input" />
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
    }).then(() => {
      console.log(defaultValue)
      openPrompt({
        ...cfg,
        defaultValue,
        children: child
      }).then(res => Promise.all(
        Object.entries(res)
          .map(([topic, value]: any) => {
            postJSON(`/set_ros_param`, { name: topic, value })
          })
      ).then(() => Toast.info("OK"), (res: any) => Toast.error(res)))
    })
}