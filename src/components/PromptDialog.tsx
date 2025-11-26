// PromptDialog.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client'; // 注意这里

type PromptOptions = {
  title?: string;
  message?: string;
  defaultValue?: string;
};

type PromptDialogProps = PromptOptions & {
  open: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

const PromptDialog: React.FC<PromptDialogProps> = ({
  open,
  title = '提示',
  message = '',
  defaultValue = '',
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue ?? '');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, defaultValue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-80 p-6">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-4 text-gray-700">{message}</p>
        <input
          ref={inputRef}
          className="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onConfirm(value);
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onConfirm(value)}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export function prompt(options: PromptOptions): Promise<string | null> {
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 用 createRoot
  const root = ReactDOM.createRoot(container);

  return new Promise<string | null>((resolve, reject) => {
    const handleConfirm = (value: string) => {
      cleanup();
      if(value == "") {
        reject()
      }
      else {
        resolve(value);
      }
    };
    const handleCancel = () => {
      cleanup();
      reject();
    };

    function cleanup() {
      root.unmount();
      container.remove();
    }

    root.render(
      <PromptDialog
        open={true}
        {...options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  });
}
