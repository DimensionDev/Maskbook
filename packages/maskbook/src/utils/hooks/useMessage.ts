import type { MessageCenter } from '@dimensiondev/holoflows-kit/es'
import { useEffect } from 'react'
import type { BatchedMessageCenter } from '../messages'

export function useMessage<T, K extends keyof T>(
    bus: MessageCenter<T> | BatchedMessageCenter<T>,
    key: K,
    callback: (data: T[K]) => void,
) {
    useEffect(() => bus.on(key, callback), [bus, callback, key])
}
