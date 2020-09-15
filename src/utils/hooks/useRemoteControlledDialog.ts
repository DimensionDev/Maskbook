import { useState, useEffect, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import type { BatchedMessageCenter } from '../messages'
import { TAB_ID } from '../../extension/tab'
import { useValueRef } from './useValueRef'
import { lastActivatedTabIdSettings } from '../../settings/settings'

export interface RemoteControlledDialogEvent {
    open: boolean
    tabId?: string
    hookId?: string
}

/**
 * Use a dialog state controlled by remote
 */
export function useRemoteControlledDialog<T, N extends keyof T>(
    MC: BatchedMessageCenter<T>,
    name: T[N] extends RemoteControlledDialogEvent ? N : never,
    onUpdateByRemote?: (ev: T[N]) => void,
) {
    const [HOOK_ID] = useState(uuid()) // create a id for every hook
    const [open, setOpen] = useState(false)
    const lastActivatedTabId = useValueRef(lastActivatedTabIdSettings)
    useEffect(
        () =>
            MC.on(name, (ev: T[N]) => {
                const ev_ = (ev as unknown) as RemoteControlledDialogEvent

                // ignore if current tab isn't the activated tab
                if (ev_.tabId !== TAB_ID) return
                // ignore the event from the same hook
                if (ev_.hookId === HOOK_ID) return

                console.log('DEBUG: onUpdateByRemote')
                console.log({
                    currentTabId: TAB_ID,
                    currentHookId: HOOK_ID,
                    activatedTab: TAB_ID === ev_.tabId,
                    sameHook: HOOK_ID === ev_.hookId,
                    ev,
                })

                setOpen(ev_.open)
                onUpdateByRemote?.(ev)
            }),
        [
            TAB_ID,
            // don't add onUpdateByRemote into the deps list
            // the user should keep it unchange
            onUpdateByRemote,
        ],
    )
    const onUpdateByLocal = useCallback(
        (ev: T[N]) => {
            const ev_ = (ev as unknown) as RemoteControlledDialogEvent
            setOpen(ev_.open)
            setTimeout(() => {
                console.log('DEBUG: onUpdateByLocal')
                console.log({
                    tabId: lastActivatedTabId,
                    hookId: HOOK_ID,
                    ev,
                })

                MC.emit(name, ({
                    tabId: lastActivatedTabId,
                    hookId: HOOK_ID,
                    ...ev,
                } as unknown) as T[N])
            }, 100)
        },
        [lastActivatedTabId],
    )
    return [open, onUpdateByLocal] as const
}
