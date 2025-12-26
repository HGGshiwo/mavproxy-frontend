import { useEffect, useState } from "react";
import { useWS } from "../../hooks/useWs";

const TabEvent = () => {
  const columns = ["time", "type", "data"]
  const [event, setEvent] = useState<any[]>([])

  const { onMessage, onClose } = useWS()
  const merge_event = (data: any[]) => {
    console.log(1233, data)
    return data.sort((a: any, b: any) => (a.time < b.time) ? 1 : -1).map((d: any) => {
      const { time, type, ..._d } = d
      return { ...d, data: JSON.stringify(_d) }
    })
  }
  useEffect(() => {
    onMessage((data: Record<string, any>) => {
      if (data.type == "state" && data.event != undefined) {
        setEvent(merge_event(data.event))
      }
      if (data.type == "event") {
        setEvent(e => ([...merge_event([data]), ...e]))
      }
    })

    onClose(() => setEvent([]))
  }, [])

  return (
    <div className="overflow-x-auto" >
      <table className="table min-w-auto table-pin-rows" style={{ maxWidth: "1500px" }}>
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