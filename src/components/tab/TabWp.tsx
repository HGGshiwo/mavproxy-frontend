import { useEffect, useState } from "react";
import { useWS } from "../../hooks/useWs";

const WpTable = () => {
  const columns = ["num", "command", "lat", "lon", "alt"]
  const [mission, setMission] = useState([])
  const [cur, setCur] = useState(0)

  const { onMessage, onClose } = useWS()

  useEffect(() => {
    onMessage((data: Record<string, any>) => {
      if (data.mission_data) {
        setMission(data.mission_data)
        setCur(0)
      }
      if (data.type == "event" && data.event == "progress") {
        setCur(data.cur)
      }
    })

    onClose(()=>setMission([]))
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
          {mission.length == 0 ?
            (<tr>
              <td colSpan={columns.length} className=" text-gray-400">
                No data
              </td>
            </tr>)
            :
            <>
              {mission.map((row, idx) => (
                <tr
                  key={idx}
                  className={cur === idx ? 'bg-base-200' : ''}
                >
                  {columns.map((col) => (
                    col == "num" ?
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

export default WpTable;
