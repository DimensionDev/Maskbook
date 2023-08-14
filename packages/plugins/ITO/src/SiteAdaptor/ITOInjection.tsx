import { useCallback, useEffect, useState } from 'react'
import { CrossIsolationMessages } from '@masknet/shared-base'

import { CompositionDialog } from './CompositionDialog.js'

export function ITOInjection() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.ITODialogEvent.on(({ open }) => {
            setOpen(open)
        })
    }, [])

    const onClose = useCallback(() => setOpen(false), [])

    if (!open) return null
    return <CompositionDialog open onClose={onClose} onConfirm={onClose} />
}
