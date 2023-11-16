import { useEffect, useState } from 'react'
import { CrossIsolationMessages, type PluginID } from '@masknet/shared-base'

import RedPacketDialog from './RedPacketDialog.js'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'

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
    return (
        <EVMWeb3ContextProvider>
            <RedPacketDialog open onClose={() => setOpen(false)} source={source} />
        </EVMWeb3ContextProvider>
    )
}
