import { MessageCenter, UnboundedRegistry } from '@dimensiondev/holoflows-kit/es'
import { useEffect } from 'react'
import { BatchedMessageCenter } from '../messages'

export const useMessage: {
    /** @deprecated use the second overload */
    <T, K extends keyof T>(
        message: MessageCenter<T> | BatchedMessageCenter<T>,
        key: K,
        callback: (data: T[K]) => void,
    ): void
    <T>(message: UnboundedRegistry<T, any>, callback: (data: T) => void): void
} = ((
    message: MessageCenter<any> | BatchedMessageCenter<any> | UnboundedRegistry<any, any>,
    key: string | ((data: any) => void),
    callback?: (data: any) => void,
) => {
    useEffect(() => {
        if (message instanceof MessageCenter || message instanceof BatchedMessageCenter) {
            if (typeof key !== 'string') throw new TypeError()
            if (typeof callback !== 'function') throw new TypeError()
            return message.on(key, callback)
        } else {
            if (typeof key !== 'function') throw new TypeError()
            return message.on(key)
        }
    }, [callback, key, message])
}) as any
