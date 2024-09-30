import { CrossIsolationMessages, type PluginID } from '@masknet/shared-base'
import { createContext, useCallback, useEffect, useState } from 'react'

import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import type { FireflyContext } from '../types.js'
import RedPacketDialog from './RedPacketDialog.js'

export const CompositionTypeContext = createContext<CompositionType>('timeline')

export function RedPacketInjection() {
    const [open, setOpen] = useState(false)
    const [source, setSource] = useState<PluginID>()
    const [compositionType, setCompositionType] = useState<CompositionType>('timeline')

    const [fireflyContext, setFireflyContext] = useState<FireflyContext>()
    useEffect(() => {
        return CrossIsolationMessages.events.redpacketDialogEvent.on(
            ({ open, source: pluginId, fireflyContext, compositionType = 'timeline' }) => {
                setOpen(open)
                setSource(pluginId)
                setFireflyContext(fireflyContext)
                setCompositionType(compositionType)
            },
        )
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    if (!open || !fireflyContext) return null
    return (
        <EVMWeb3ContextProvider>
            <CompositionTypeContext.Provider value={compositionType}>
                <RedPacketDialog open onClose={handleClose} source={source} fireflyContext={fireflyContext} />
            </CompositionTypeContext.Provider>
        </EVMWeb3ContextProvider>
    )
}
