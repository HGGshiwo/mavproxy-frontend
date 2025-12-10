import { getJSON, postJSON } from '../../utils'
import { Toast } from '../Toast'
import { openPrompt } from './BaseDialog'

export default async function promptGimbal(cfg: any) {
  let child: any = {}
  let defaultValue: any = {}

  return getJSON("/get_gimbal")?.then(async (res: any) => {
      if(res.status != "success") {
        Toast.error(res.msg)
        return
      }
      defaultValue = res.msg
      child = {
        mode: (value1: number, onChange: any) => (
          <fieldset className="fieldset">
            <legend className="fieldset-legend">模式</legend>
            <select value={value1} onChange={(e) => onChange(e.target.value)} className="select">
              <option>body</option>
              <option>abs</option>
            </select>
          </fieldset>
        ),
        angle: (value1: number, onChange: any) => (
          <fieldset className="fieldset">
            <legend className="fieldset-legend">角度</legend>
            <input type="number" value={value1} onChange={(e) => onChange(parseFloat(e.target.value))} className="input" />
          </fieldset>
        )
      }

      console.log(defaultValue)
      openPrompt({
        ...cfg,
        defaultValue,
        children: child
      }).then(res => postJSON(`/set_gimbal`, res, true))
    })
}