import { useEffect, useState } from 'react'
import { CrossIsolationMessages, NetworkPluginID, type PluginID } from '@masknet/shared-base'

import RedPacketDialog from './RedPacketDialog.js'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'

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
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
            <RedPacketDialog open onClose={() => setOpen(false)} source={source} />
        </Web3ContextProvider>
    )
}
