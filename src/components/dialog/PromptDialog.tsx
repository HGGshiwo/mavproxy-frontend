import { openPrompt } from './BaseDialog'

export default function prompt(cfg: any) {
  return openPrompt({
    ...cfg,
    defaultValue: {"input": ""},
    children: {
      input: (value, setValue, inputRef) => (
        <input
          ref={inputRef}
          className="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      )
    }
  })
  .then(res => res["input"])
}