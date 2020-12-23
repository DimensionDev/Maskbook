import { useState, useEffect, useCallback, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import type { UnboundedRegistry } from '@dimensiondev/holoflows-kit'

export interface RemoteControlledDialogEvent {
    open: boolean
    hookId?: string
}

/**
 * Use a dialog state controlled by remote
 */
export function useRemoteControlledDialog<T extends { open: boolean }>(
    event: UnboundedRegistry<T>,
    onUpdateByRemote?: (ev: T) => void,
    tabType: 'self' | 'activated' = 'self',
) {
    const [HOOK_ID] = useState(uuid()) // create a id for every hook
    const [open, setOpen] = useState(false)
    useEffect(
        () =>
            event.on((_ev: T) => {
                const event = (_ev as unknown) as RemoteControlledDialogEvent

                // ignore the event from the same hook
                if (event.hookId === HOOK_ID) return

                setOpen(event.open)
                onUpdateByRemote?.(_ev)
            }),
        [onUpdateByRemote, event, HOOK_ID],
    )

    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onUpdateByLocal = useCallback(
        (ev: T) => {
            setOpen(ev.open)

            const timer_ = timer.current
            if (timer_ !== null) clearTimeout(timer_)
            timer.current = setTimeout(() => {
                const payload: T & RemoteControlledDialogEvent = {
                    hookId: HOOK_ID,
                    ...ev,
                }
                tabType === 'self' ? event.sendToLocal(payload) : event.sendToVisiblePages(payload)
            }, 100)
        },
        [event, tabType, HOOK_ID],
    )
    return [open, onUpdateByLocal] as const
}
