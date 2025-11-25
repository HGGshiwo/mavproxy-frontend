import { useEffect, useState } from "react";
import { useWS } from "../hooks/useWs";

const WpTable = () => {
  const columns = ["num", "command", "param1", "param2", "param3", "lat", "lon", "alt", "frame"]
  const [mission,  setMission] = useState([])
  const [cur, setCur] = useState(0)

  const { onMessage } = useWS()

  useEffect(()=>{
    onMessage(({data})=>{
      if(data.mission) {
        setMission(data.mission)
        setCur(0)
      }
      if(data.type == "event" && data.event == "progress") {
        setCur(data.cur)
      }
    })
  }, [])

  return (
    <div className="overflow-x-auto">
      <table className="table">
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
              <td colSpan={columns.length} className="text-center text-gray-400">
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
                    <td className="text-center" key={col}>{row[col]}</td>
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
