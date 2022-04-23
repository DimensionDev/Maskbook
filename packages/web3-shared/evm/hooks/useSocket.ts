import { useWeb3Context } from '../context'
import { useAsyncRetry } from 'react-use'
import type { NotifyFn, RequestMessage } from '@masknet/web3-shared-base'
import { v4 as uuid } from 'uuid'
import { useCallback, useEffect, useState } from 'react'

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
    const [id, setId] = useState(uuid)
    const { value: socket, loading } = useAsyncRetry(() => providerSocket, [])
    const requestId = `${message.id}_${id}`

    useEffect(() => {
        setState(SocketState.init)
        setData([])
        setError(undefined)
    }, [message.id])

    const { retry } = useAsyncRetry(async () => {
        if (!socket || !message.id || loading) return
        const notifyUpdatedHook: NotifyFn = (info) => {
            if (requestId !== info.id) return
            if (!info.done) {
                setState(SocketState.receiving)
            } else {
                // workaround for get data from cache
                setTimeout(() => setState(SocketState.done), 0)
            }
            setError(info.error)
            if (!socket) return
            setData(socket.getResult<T>(requestId))
        }

        socket.send({ ...message, notify: notifyUpdatedHook, id: requestId })
        // Get data from cache
        setData(socket.getResult<T>(requestId))
        setState(SocketState.sent)
    }, [requestId, socket, loading])

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
