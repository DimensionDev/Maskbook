import { CrossIsolationMessages, type PluginID } from '@masknet/shared-base'
import { createContext, useCallback, useEffect, useState } from 'react'

import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
<<<<<<< HEAD
import type { FireflyContext } from '../types.js'
=======
import RedPacketDialog from './RedPacketDialog.js'

export const CompositionTypeContext = createContext<CompositionType>('timeline')
>>>>>>> develop

export function RedPacketInjection() {
    const [open, setOpen] = useState(false)
    const [source, setSource] = useState<PluginID>()
    const [compositionType, setCompositionType] = useState<CompositionType>('timeline')

    const [fireflyContext, setFireflyContext] = useState<FireflyContext>()
    useEffect(() => {
<<<<<<< HEAD
        return CrossIsolationMessages.events.redpacketDialogEvent.on(({ open, source: pluginId, fireflyContext }) => {
            setOpen(open)
            setSource(pluginId)
            setFireflyContext(fireflyContext)
        })
=======
        return CrossIsolationMessages.events.redpacketDialogEvent.on(
            ({ open, source: pluginId, compositionType = 'timeline' }) => {
                setCompositionType(compositionType)
                setOpen(open)
                setSource(pluginId)
            },
        )
>>>>>>> develop
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    if (!open) return null
    return (
        <EVMWeb3ContextProvider>
<<<<<<< HEAD
            <RedPacketDialog open onClose={handleClose} source={source} fireflyContext={fireflyContext} />
=======
            <CompositionTypeContext.Provider value={compositionType}>
                <RedPacketDialog open onClose={handleClose} source={source} />
            </CompositionTypeContext.Provider>
>>>>>>> develop
        </EVMWeb3ContextProvider>
    )
}
