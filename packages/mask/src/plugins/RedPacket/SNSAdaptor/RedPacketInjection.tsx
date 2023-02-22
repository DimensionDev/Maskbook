import { CrossIsolationMessages } from '@masknet/shared-base'
import { useEffect, useState } from 'react'

import RedPacketDialog from './RedPacketDialog.js'

export function RedPacketInjection() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.redpacketDialogEvent.on(({ open }) => {
            setOpen(open)
        })
    }, [])

    if (!open) return null
    return <RedPacketDialog open onClose={() => setOpen(false)} />
}
