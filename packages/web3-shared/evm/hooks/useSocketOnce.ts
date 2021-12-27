import { getWebSocketInstance, PayloadMessage, RequestMessage } from '@masknet/web3-shared-base'
import { useEffect, useState } from 'react'
import { useAsyncRetry } from 'react-use'

export const useSocketOnce = <T>(message: Omit<RequestMessage, 'notify'>) => {
    const [data, setData] = useState<T[]>([])
    const [done, setDone] = useState(false)
    const [error, setError] = useState<unknown>()
    const { value: ws, retry } = useAsyncRetry(() => getWebSocketInstance(), [])

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
