import { useEffect, useState } from "react"
import { useWS } from "../hooks/useWs"

export default function Status() {
    const { onMessage } = useWS()

    const [state, _setState] = useState("")
    const setState = (state: string) => _setState(`status status-xl animate-ping status-${state}`)

    useEffect(() => {
        setState("error")
        onMessage((data: Record<string, any>) => {
            if (data["state"] == "state" && data["connected"] != undefined) {
                const connected = data["connected"]
                setState(connected ? "success" : "error")
            }
        })
    }, [])

    return (
        <div aria-label="status" className={state}></div>
    )
}
