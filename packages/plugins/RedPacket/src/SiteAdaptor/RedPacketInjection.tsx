import { useCallback, useEffect, useState } from 'react'
import { CrossIsolationMessages, type PluginID } from '@masknet/shared-base'

import RedPacketDialog from './RedPacketDialog.js'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import type { FireflyContext } from '../types.js'

export function RedPacketInjection() {
    const [open, setOpen] = useState(false)
    const [source, setSource] = useState<PluginID>()
    
    const [fireflyContext, setFireflyContext] = useState<FireflyContext>()
    useEffect(() => {
        return CrossIsolationMessages.events.redpacketDialogEvent.on(({ open, source: pluginId, fireflyContext }) => {
            setOpen(open)
            setSource(pluginId)
            setFireflyContext(fireflyContext)
        })
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    if (!open) return null
    return (
        <EVMWeb3ContextProvider>
            <RedPacketDialog open onClose={handleClose} source={source} fireflyContext={fireflyContext} />
        </EVMWeb3ContextProvider>
    )
}
