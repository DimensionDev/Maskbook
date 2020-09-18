import { useState, useEffect } from 'react'
import type { BatchedMessageCenter } from '../messages'

export interface RemoteControlledDialogEvent {
    open: boolean
}

/**
 * Use a dialog state controlled by remote
 */
export function useRemoteControlledDialog<T, N extends keyof T>(
    MC: BatchedMessageCenter<T>,
    name: T[N] extends RemoteControlledDialogEvent ? N : never,
    onUpdate?: (ev: T[N]) => void,
) {
    const [open, setOpen] = useState(false)
    useEffect(
        () =>
            MC.on(name, (ev: T[N]) => {
                setOpen(((ev as unknown) as RemoteControlledDialogEvent).open)
                onUpdate?.(ev)
            }),
        [onUpdate],
    )
    return [
        open,
        (ev: T[N]) => {
            setOpen(((ev as unknown) as RemoteControlledDialogEvent).open)
            setTimeout(() => MC.emit(name, ev), 100)
        },
    ] as const
}
