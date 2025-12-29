import { getJSON, postJSON } from '../../utils'
import { Toast } from '../Toast'
import { openPrompt } from './BaseDialog'

export default async function promptDetect(cfg: any) {
  let child: any = {}
  let defaultValue: any = {}

  const options = ["smoke", "nohardhat"]

  return getJSON("/get_detect")?.then(async (res: any) => {
    if (res.status != "success") {
      Toast.error(res.msg)
      return
    }

    defaultValue["type"] = res.msg == "" ? options[0] : res.msg
    child = {
      type: (value1: number, onChange: any) => (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">类型</legend>
          <select value={value1} onChange={(e) => onChange(e.target.value)} className="select">
            {options.map(name => <option key={name}>{name}</option>)}
          </select>
        </fieldset>
      ),
    }

    console.log(defaultValue)
    openPrompt({
      ...cfg,
      defaultValue,
      children: child
    }).then(({ type }: any) => {
      return postJSON(`/start_detect`, { type }, true)
    })
  })
}