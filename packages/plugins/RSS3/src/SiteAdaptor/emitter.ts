import type { Plugin } from '@masknet/plugin-infra'
import { Emitter } from '@servie/events'
import { useEffect, useLayoutEffect, useState } from 'react'

type Slot = Plugin.SiteAdaptor.ProfileTabSlot
// We hide emitter inside this file, it would be better to not export
const emitter = new Emitter<{ 'toggle-filter': [slot: Slot]; 'set-state': [slot: Slot, enabled: boolean] }>()

export function toggleFilter(slot: Slot) {
    emitter.emit('toggle-filter', slot)
}

export function useInsideFeedsTab(slot: Slot) {
    useLayoutEffect(() => {
        emitter.emit('set-state', slot, true)
        return () => {
            emitter.emit('set-state', slot, false)
        }
    }, [slot])
}

export function useIsTabActionEnabled(slot: Slot) {
    const [enabled, setEnabled] = useState(false)
    useLayoutEffect(() => {
        const unsubscribe = emitter.on('set-state', (fromSlot, status) => {
            if (fromSlot !== slot) return
            setEnabled(status)
        })
        return () => void unsubscribe()
    }, [slot])
    return enabled
}

export function useIsFiltersOpen(slot: Slot) {
    const [open, setOpen] = useState(false)
    useEffect(() => {
        const unsubscribe = emitter.on('toggle-filter', (fromSlot) => {
            if (fromSlot !== slot) return
            setOpen((v) => !v)
        })
        return () => {
            unsubscribe()
        }
    }, [slot])
    return [open, setOpen] as const
}
