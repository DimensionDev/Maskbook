import { useWeb3Context } from '../context'
import { useAsyncRetry } from 'react-use'
import type { NotifyFn, RequestMessage } from '@masknet/web3-shared-base'
import { v4 as uuid } from 'uuid'
import { useCallback, useState } from 'react'

type SocketMessage = Omit<RequestMessage, 'notify'>

export enum SocketState {
    init = 'init',
    sent = 'sent',
    receiving = 'receiving',
    done = 'done',
}

export const useSocket = <T>(message: SocketMessage) => {
    const { providerSocket } = useWeb3Context()
    const [data, setData] = useState<T[]>([])
    const [state, setState] = useState(SocketState.init)
    const [error, setError] = useState<unknown>()
    const [id, setId] = useState(uuid())
    const { value: socket, loading } = useAsyncRetry(() => providerSocket, [])

    const { retry } = useAsyncRetry(async () => {
        if (!socket || !message.id || loading) return
        const requestId = `${message.id}_${id}`
        const notifyUpdatedHook: NotifyFn = (info) => {
            if (!info.done) {
                setState(SocketState.receiving)
            } else {
                setState(SocketState.done)
            }
            setError(info.error)
            if (!socket) return
            const requestId = `${message.id}_${id}`
            setData(socket.getResult<T>(requestId))
        }

        socket.send({ ...message, notify: notifyUpdatedHook, id: requestId })
        // Get data from cache
        setData(socket.getResult<T>(requestId))
        setState(SocketState.sent)
    }, [message.id, socket, loading, id])

    const handleRetry = useCallback(() => {
        setId(uuid())
        setState(SocketState.sent)
        setData([])
        retry()
    }, [retry])

    return {
        data: data ?? [],
        state,
        error,
        retry: handleRetry,
    }
}
