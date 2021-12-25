import { useEffect, useState } from 'react'
import { useAsyncRetry } from 'react-use'

export interface MessageBase {
    id: string
}

export interface RequestMessage extends MessageBase {
    method: string
    params: unknown
}

export interface PayloadMessage<T> extends MessageBase {
    error?: unknown
    results?: T[]
}

const DEV = 'wss://hyper-proxy-development.mask-reverse-proxy.workers.dev'
const getWebSocketInstance = async (point: string) => {
    const socket = new WebSocket(point)
    const waitingOpen = () => {
        return new Promise<void>((resolve, reject) => {
            socket.addEventListener('open', () => resolve())
            socket.addEventListener('error', () => reject())
        })
    }
    await waitingOpen()
    return socket
}

export const useWebSocket = <T>(message: RequestMessage) => {
    const [data, setData] = useState<T[]>([])
    const [done, setDone] = useState(false)
    const [error, setError] = useState<unknown>()
    const { value: ws, retry } = useAsyncRetry(() => getWebSocketInstance(DEV), [])

    useEffect(() => {
        if (!ws) return
        ws.addEventListener('message', (event: MessageEvent<string>) => {
            const { results = [], error } = JSON.parse(event.data) as PayloadMessage<T>
            if (error) {
                setError(error)
                setDone(true)
                return
            }
            if (results.length === 0) {
                setDone(true)
                return
            }
            setData((pr) => [...pr, ...results])
        })
        ws.send(JSON.stringify(message))

        return () => {
            ws.close()
        }
    }, [ws])

    return {
        done,
        error,
        data,
        retry: () => {
            setData([])
            setError(undefined)
            setDone(false)
            retry()
        },
    }
}
