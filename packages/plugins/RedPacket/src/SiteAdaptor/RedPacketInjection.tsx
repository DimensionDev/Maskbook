import { CrossIsolationMessages, type PluginID } from '@masknet/shared-base'
import { createContext, useCallback, useEffect, useState } from 'react'

import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import RedPacketDialog from './RedPacketDialog.js'

export const CompositionTypeContext = createContext<CompositionType>('timeline')

export function RedPacketInjection() {
    const [open, setOpen] = useState(false)
    const [source, setSource] = useState<PluginID>()
    const [compositionType, setCompositionType] = useState<CompositionType>('timeline')

    useEffect(() => {
        return CrossIsolationMessages.events.redpacketDialogEvent.on(
            ({ open, source: pluginId, compositionType = 'timeline' }) => {
                setCompositionType(compositionType)
                setOpen(open)
                setSource(pluginId)
            },
        )
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    if (!open) return null
    return (
        <EVMWeb3ContextProvider>
            <CompositionTypeContext.Provider value={compositionType}>
                <RedPacketDialog open onClose={handleClose} source={source} />
            </CompositionTypeContext.Provider>
        </EVMWeb3ContextProvider>
    )
}
