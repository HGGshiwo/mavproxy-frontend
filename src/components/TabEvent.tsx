import { useEffect, useState } from "react";
import { useWS } from "../hooks/useWs";

const TabEvent = () => {
  const columns = ["time", "type", "data"]
  const [event, setEvent] = useState<any[]>([])

  const { onMessage } = useWS()

  useEffect(() => {
    onMessage((data: Record<string, any>) => {
      if (data.type != "state") {
        const d = new Date()
        const fill0 = (n: any) => n.toString().padStart(2, '0')
        const time = `${fill0(d.getHours())}:${fill0(d.getMinutes())}:${fill0(d.getSeconds())}`
        setEvent(e => ([{ data: JSON.stringify(data), time, type: data.type }, ...e]))
      }
    })
  }, [])

  return (
    <div className="overflow-x-auto" >
      <table className="table min-w-auto" style={{ maxWidth: "1500px" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {event.length == 0 ?
            (<tr>
              <td colSpan={columns.length} className=" text-gray-400">
                No data
              </td>
            </tr>)
            :
            <>
              {event.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    col == "time" ?
                      <td className="font-bold" key={col}>{row[col]}</td> :
                      <td key={col}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </>}
        </tbody>
      </table>
    </div>
  );
};

export default TabEvent;