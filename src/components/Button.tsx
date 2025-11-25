import { useWS } from "../hooks/useWs";


interface ButtonProps {
    command?: string;
    onClick?: Function;
    children: string;
}


export default function Button({ command = undefined, onClick = undefined, children }: ButtonProps) {
    const { send } = useWS()
    const callback = (event: any) => {
        if (command) {
            send(command)
        }
        else if (onClick) {
            onClick(event)
        }
    }
    return (
        <button className="btn btn-lg" onClick={callback}>{children}</button>
    )
}