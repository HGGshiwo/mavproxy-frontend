// ParamsModal.tsx
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { getJSON, postJSON } from "../utils";
import ReactDOM from "react-dom/client";
import { useWS } from "../hooks/useWs";
import { Toast } from "./Toast";

// 原始参数类型
export type ParamItem = {
  id: string;
  group: string;
  name: string;
  help: string;
  _help: string[];
  default: string | number;
  value: string | number;
};

type Props = {
  open: boolean;
  onClose?: () => void;
};

export type ParamsModalHandle = {
  open: () => void;
};

// 多级菜单节点类型
type MenuNode = {
  label: string;
  children?: MenuNode[];
  items?: ParamItem[];
  path: string;
};

// 构建多级菜单树
function buildMenuTree(items: ParamItem[]): MenuNode[] {
  const root: MenuNode[] = [];
  const map = new Map<string, MenuNode>();

  items.forEach((item) => {
    // 用 group 拆分多级
    const parts = item.group.split("_");
    let curArr = root;
    let path = "";
    for (let i = 0; i < parts.length; i++) {
      path = path ? path + "_" + parts[i] : parts[i];
      let node = curArr.find((node) => node.label === parts[i]);
      if (!node) {
        node = { label: parts[i], path, children: [] };
        curArr.push(node);
        map.set(path, node);
      }
      if (i === parts.length - 1) {
        // 叶子分组，放参数
        if (!node.items) node.items = [];
        node.items.push(item);
      }
      curArr = node.children!;
    }
  });
  return root;
}

// 递归渲染多级菜单
type SidebarMenuProps = {
  menu: MenuNode[];
  selectedPath: string | null;
  selectedItemId: string | null;
  onSelectGroup: (path: string) => void;
  onSelectItem: (groupPath: string, itemId: string) => void;
};

function SidebarMenu({
  menu,
  selectedPath,
  selectedItemId,
  onSelectGroup,
  onSelectItem,
}: SidebarMenuProps) {
  return (
    <ul className="menu bg-base-200 rounded-box w-fit overflow-y-auto flex-nowrap">
      <li>
        <a
          className={!selectedPath && !selectedItemId ? "bg-base-300" : ""}
          onClick={() => {
            onSelectGroup("");
          }}
        >
          全部
        </a>
      </li>
      {menu.map((node) => (
        <MenuNodeComponent
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          selectedItemId={selectedItemId}
          onSelectGroup={onSelectGroup}
          onSelectItem={onSelectItem}
        />
      ))}
    </ul>
  );
}

function MenuNodeComponent({
  node,
  selectedPath,
  selectedItemId,
  onSelectGroup,
  onSelectItem,
}: {
  node: MenuNode;
  selectedPath: string | null;
  selectedItemId: string | null;
  onSelectGroup: (path: string) => void;
  onSelectItem: (groupPath: string, itemId: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const hasItems = node.items && node.items.length > 0;

  if (hasChildren) {
    return (
      <li>
        <details>
          <summary
            className={selectedPath === node.path && !selectedItemId ? "bg-base-300" : ""}
            onClick={(e) => {
              e.stopPropagation();
              onSelectGroup(node.path);
            }}
          >
            {node.label}
          </summary>
          <ul>
            {hasItems &&
              node.items!.map((item) => (
                <li key={item.id}>
                  <a
                    className={selectedItemId === item.id ? "bg-base-200" : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(node.path, item.id);
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            {node.children!.map((child) => (
              <MenuNodeComponent
                key={child.path}
                node={child}
                selectedPath={selectedPath}
                selectedItemId={selectedItemId}
                onSelectGroup={onSelectGroup}
                onSelectItem={onSelectItem}
              />
            ))}
          </ul>
        </details>
      </li>
    );
  }
  // 叶子节点
  return (
    <li>
      <details>
        <summary
          className={selectedPath === node.path && !selectedItemId ? "bg-base-300" : ""}
          onClick={(e) => {
            e.stopPropagation();
            onSelectGroup(node.path);
          }}
        >
          {node.label}
        </summary>
        <ul>
          {hasItems &&
            node.items!.map((item) => (
              <li key={item.id}>
                <a
                  className={selectedItemId === item.id ? "bg-base-200" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem(node.path, item.id);
                  }}
                >
                  {item.name}
                </a>
              </li>
            ))}
        </ul>
      </details>
    </li>
  );
}

// 主组件
const ParamsModal = forwardRef<ParamsModalHandle, Props>(
  ({ open, onClose }, ref) => {
    // 状态
    const [rawData, setRawData] = useState<ParamItem[]>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [updateData, setUpdateData] = useState<Record<string, string | number>>({});
    const [modalOpen, setModalOpen] = useState(open);

    useImperativeHandle(ref, () => ({
      open: () => setModalOpen(true),
    }));

    useEffect(() => {
      setModalOpen(open);
    }, [open]);

    useWS();

    // 获取数据
    useEffect(() => {
      if (!modalOpen) return;
      getJSON("/params")!.then((data) => {
        if (data.status !== "success") return;
        data = data.msg;
        const arr = Object.keys(data)
          .map((key) => ({
            id: key,
            group: key.split("_")[0], // 这里你可以自定义分组规则
            name: key,
            help: data[key].help[0],
            _help: data[key].help,
            default: data[key].default,
            value: data[key].value,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setRawData(arr);
        setSearchKeyword("");
        setSelectedGroup(null);
        setSelectedItemId(null);
        setUpdateData({});
      });
    }, [modalOpen]);

    // 过滤
    const getFilteredData = () => {
      if (!searchKeyword) return rawData;
      const kw = searchKeyword.trim().toLowerCase();
      return rawData.filter(
        (item) =>
          item.group.toLowerCase().includes(kw) ||
          item.name.toLowerCase().includes(kw) ||
          item.help.toLowerCase().includes(kw)
      );
    };

    // 选中分组/参数后表格数据
    const getCurrentTableData = () => {
      const data = getFilteredData();
      if (!selectedGroup && !selectedItemId) {
        return data;
      } else if (selectedGroup && !selectedItemId) {
        return data.filter((item) => item.group.startsWith(selectedGroup));
      } else if (selectedGroup && selectedItemId) {
        return data.filter((item) => item.id === selectedItemId);
      }
      return data;
    };

    // 编辑 cell
    const handleCellEdit = (id: string, value: string | number) => {
      setUpdateData((prev) => ({
        ...prev,
        [id]: value,
      }));
      setRawData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, value } : item))
      );
    };

    // 关闭
    const handleCancel = () => {
      setModalOpen(false);
      onClose?.();
    };

    // 确认
    const handleConfirm = () => {
      Promise.all(Object.entries(updateData).map(([name, value]) => {
        return postJSON("/set_param", { name, value })
      }))
        .then(res => {
          const out = res.filter((r: any) => r["msg"] != "OK")
          if (out.length == 0) {
            Toast.info("OK")
          }
          else {
            Toast.error(JSON.stringify(out))
          }
        }, err => Toast.error(JSON.stringify(err)))
        .finally(() => {
          setModalOpen(false);
          onClose?.();
        });
    };

    // 侧边栏数据
    const filteredData = getFilteredData();
    // 这里要把 group 字段改成多级结构（如 group: "A_B_C"），你可以根据实际 group 字段调整
    const menuTree = buildMenuTree(
      filteredData.map((item) => ({
        ...item,
        group: item.group, // 如果 group 字段本身就是多级，如 "A_B_C"
      }))
    );

    return (
      <div className={modalOpen ? "modal modal-open max-h-full" : "modal max-h-full"}>
        <div className="modal-box w-11/12 max-w-5xl flex flex-col" style={{ height: "600px" }}>
          <h3 className="font-bold text-lg mb-2">参数设置</h3>
          <div className="flex gap-4 flex-1 min-h-0 overflow-auto">
            {/* Sidebar */}
            <SidebarMenu
              menu={menuTree}
              selectedPath={selectedGroup}
              selectedItemId={selectedItemId}
              onSelectGroup={(path) => {
                setSelectedGroup(path || null);
                setSelectedItemId(null);
              }}
              onSelectItem={(groupPath, itemId) => {
                setSelectedGroup(groupPath);
                setSelectedItemId(itemId);
              }}
            />
            {/* Main Table */}
            <div className="flex-1 overflow-x-auto flex flex-col h-full">
              {/* 搜索框 */}
              <div className="mb-2">
                <input
                  className="input input-bordered w-full"
                  placeholder="搜索分组/名称/说明"
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setSelectedGroup(null);
                    setSelectedItemId(null);
                  }}
                />
              </div>
              <div className="flex-1 min-h-auto overflow-auto">
                <table className="table table-zebra table-pin-rows">
                  <thead>
                    <tr>
                      <th>名称</th>
                      <th>说明</th>
                      <th>默认值</th>
                      <th>当前值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentTableData().map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td
                          className="help-cell"
                          title={item._help.join("\n")}
                        >
                          {item.help}
                        </td>
                        <td>{item.default}</td>
                        <td
                          className="editable-cell col3"
                          style={{ cursor: "pointer" }}
                        >
                          <EditableCell
                            value={item.value}
                            onChange={(val) => handleCellEdit(item.id, val)}
                          />
                        </td>
                      </tr>
                    ))}
                    {getCurrentTableData().length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-gray-400">
                          无数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={handleCancel}
              id="tableCancelBtn"
            >
              取消
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              id="tableConfirmBtn"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    );
  }
);

// 可编辑单元格
const EditableCell: React.FC<{
  value: string | number;
  onChange: (val: string | number) => void;
}> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(value);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  const handleBlur = () => {
    setEditing(false);
    onChange(inputVal);
  };

  return editing ? (
    <input
      className="input input-bordered input-sm w-full"
      type="text"
      value={inputVal as string}
      autoFocus
      onChange={(e) => setInputVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape") {
          handleBlur();
        }
      }}
    />
  ) : (
    <span onClick={() => setEditing(true)}>{value}</span>
  );
};

let modalRef: React.RefObject<ParamsModalHandle | null> | null = null;

function openParamsModal() {
  if (!modalRef) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    modalRef = React.createRef<ParamsModalHandle>();
    root.render(<ParamsModal ref={modalRef} open={false} />);
  }
  setTimeout(() => {
    modalRef?.current?.open();
  }, 0);
}

export { ParamsModal, openParamsModal };
