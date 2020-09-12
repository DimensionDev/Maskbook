import { useState } from 'react'
import type { BatchedMessageCenter } from '../messages'

export interface DialogUpdatedEvent<T> {
    open: boolean
    data?: T
}

/**
 *
 */
export function useRemoteControlledDialog<
    T,
    M extends BatchedMessageCenter<T>, // the message center
    N extends keyof T, // the typeof event name
    P extends unknown, // the typeof event data
    U extends DialogUpdatedEvent<P> // the typeof event payload
>(MC: M, name: N, onOpen?: () => P, onClose?: () => P) {
    const [open, setOpen] = useState(false)

    // const data = onOpen?.()
    if (onOpen) {
        const data = onOpen?.()
        MC.emit(name, ({
            open: true,
            data,
        } as any) as T[N])
    }

    return {
        open,
    }
}
