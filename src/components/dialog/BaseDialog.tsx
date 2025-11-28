// PromptDialog.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';


type PromptOptions = {
  title?: string;
  message?: any;
  defaultValue?: any;
  children: Record<string, (value: any, onChange: (v: any) => void, inputRef: React.Ref<any>) => ReactNode>;
};

type PromptDialogProps = PromptOptions & {
  open: boolean;
  onConfirm: (value: any) => void;
  onCancel: () => void;
};

const BaseDialog: React.FC<PromptDialogProps> = ({
  open,
  title = '提示',
  message = '',
  defaultValue = {},
  children,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus && inputRef.current?.focus(), 100);
    }
  }, [open, defaultValue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl min-w-xl w-fit p-6">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-4 text-gray-700">{message}</p>
        <div className="mb-4 flex-col">
          {
            Object.entries(children).map(([key, func], i) => {
              const ref = i == 0 ? inputRef : null;
              return <div className='m-4'>{func(value[key], newV => setValue((v: any) => ({ ...v, [key]: newV })), ref)}</div>
            })
          }
        </div>
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



function openPrompt(options: PromptOptions): Promise<any> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);

  return new Promise<any>((resolve, reject) => {
    const handleConfirm = (value: any) => {
      cleanup();
      if (value === "") {
        reject();
      } else {
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
      <BaseDialog
        open={true}
        {...options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  });
}

export { openPrompt, BaseDialog };
