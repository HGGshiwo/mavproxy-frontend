import { getJSON, postJSON } from '../../utils'
import { Toast } from '../Toast'
import { openPrompt } from './BaseDialog'

export default async function promptGimbal(cfg: any) {
  let child: any = {}
  let defaultValue: any = {}
  
  const handleInputChange = (e: any, setInputValue: any) => {
    const value = e.target.value;
    // 保留纯负号
    if (value === '-') {
      setInputValue('-');
      return;
    }
    // 优化：避免步进时出现 "-0"（可选）
    if (value === '-0') {
      setInputValue('0');
      return;
    }
    setInputValue(value);
  };

  return getJSON("/get_gimbal")?.then(async (res: any) => {
    if (res.status != "success") {
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
          <input type="text" value={value1} onChange={(e) => handleInputChange(e, onChange)} className="input" />
        </fieldset>
      )
    }

    console.log(defaultValue)
    openPrompt({
      ...cfg,
      defaultValue,
      children: child
    }).then(({mode, angle}: any) => {
      const float = parseFloat(angle)
      if(Number.isNaN(float)) return Toast.error(`not a valid float: ${angle}`)
      return postJSON(`/set_gimbal`, {mode, angle: float}, true)
    })
  })
}