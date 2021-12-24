// TODO: move to shared
import { useWeb3Context } from '../context'
import { useAsyncRetry } from 'react-use'
import type { NotifyFn, RequestMessage } from '@masknet/web3-shared-base'
import { v4 as uuid } from 'uuid'
import { useState } from 'react'

type SocketMessage = Omit<RequestMessage, 'notify'>

export const useSocket = <T>(message: SocketMessage) => {
    const { providerSocketInstance } = useWeb3Context()
    const [count, setCount] = useState(0)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<unknown>()
    const [id] = useState(uuid())

    const notifyUpdated: NotifyFn = (info) => {
        setDone(info.done)
        setError(info.error)
        setCount((prov) => prov + 1)
    }

    const { value, retry } = useAsyncRetry(async () => {
        const socket = await providerSocketInstance
        const requestId = `${message.id}_${id}`

        socket.send({ ...message, notify: notifyUpdated, id: requestId })
        return socket.getResult<T>(requestId)
    }, [count, message.id])

    return { data: value, done, error, retry }
}
