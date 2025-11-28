import { getJSON, postJSON } from '../../utils'
import { openPrompt } from './BaseDialog'
import { Toast } from '../Toast'

export default async function promptNode(cfg: any) {
  let child: any = {}
  let defaultValue: any = {}

  return getJSON("/get_ros_param/mavproxy/other/node_cfg")?.then((res: any) => res["msg"])
    .then(async (topic_cfg: any[]) => {
      const childCfg = await Promise.all(topic_cfg.map(({ topic, title }) => {
        return getJSON(`/get_ros_param${topic}`)?.then(res => {
          const value = res["status"] == "error" ? undefined : res["msg"]
          return { value, topic, title }
        })
      }))
      const _c: Record<string, any> = {}
      childCfg.filter(v => (!!v && v.value != undefined)).forEach(({ value, topic, title }: any) => {
        defaultValue = { ...defaultValue, [topic]: value }
        _c[topic] = (value1: boolean, onChange: any) => (
          <label className="label">
            <input type="checkbox" checked={value1} onChange={(e) => onChange(e.target.checked)} className="toggle" />
            {title}
          </label>
        )
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