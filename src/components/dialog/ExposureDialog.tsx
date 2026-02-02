import { InputNumber } from 'antd'
import { getJSON, postJSON } from '../../utils'
import { Toast } from '../Toast'
import { openPrompt } from './BaseDialog'

export default async function promptExposure(cfg: any) {
  let child: any = {}
  let defaultValue: any = {}

  return getJSON("/get_exposure")?.then(async (res: any) => {
    if (res.status != "success") {
      Toast.error(res.msg)
      return
    }
    const { shutter, sensitivity } = res.msg
    defaultValue = { shutter: shutter.value, sensitivity: sensitivity.value }
    child = {
      shutter: (value1: number, onChange: any) => (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">快门时间</legend>
          <div className='flex flex-row justify-center items-center'>
            {/* <input type="range" min={shutter.min} max={shutter.max} value={value1} className="range range-neutral" onChange={(e) => onChange(e.target.value)} />
            <span className='pl-1'>{value1}</span> */}
            <InputNumber mode="spinner" step={shutter.step} min={shutter.min} max={shutter.max} value={value1} variant="filled" onChange={(e) => onChange(e)} placeholder="Filled" />
          </div>

        </fieldset>
      ),
      sensitivity: (value1: number, onChange: any) => (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">感光度</legend>
          <div className='flex flex-row justify-center items-center'>
            {/* <input type="range" min={sensitivity.min} max={sensitivity.max} value={value1} className="range range-neutral" onChange={(e) => onChange(e.target.value)} />
            <span className='pl-1'>{value1}</span> */}
            <InputNumber mode="spinner" step={sensitivity.step} min={sensitivity.min} max={sensitivity.max} value={value1} variant="filled" onChange={(e) => onChange(e)} placeholder="Filled" />
          </div>
        </fieldset>
      )
    }

    console.log(defaultValue)
    openPrompt({
      ...cfg,
      defaultValue,
      children: child
    }).then(({ shutter, sensitivity }: any) => {
      return postJSON(`/set_exposure`, { shutter, sensitivity }, true)
    })
  })
}