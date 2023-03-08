import { CrossIsolationMessages, PluginID } from '@masknet/shared-base'
import { useEffect, useState } from 'react'

import RedPacketDialog from './RedPacketDialog.js'

export function RedPacketInjection() {
    const [open, setOpen] = useState(false)
    const [source, setSource] = useState<PluginID>()

    useEffect(() => {
        return CrossIsolationMessages.events.redpacketDialogEvent.on(({ open, source: pluginId }) => {
            setOpen(open)
            setSource(pluginId)
        })
    }, [])

    if (!open) return null
    return <RedPacketDialog open onClose={() => setOpen(false)} source={source} />
}
