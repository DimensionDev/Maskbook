import { CrossIsolationMessages, type PluginID } from '@masknet/shared-base'
import { createContext, useCallback, useEffect, useState } from 'react'

import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import type { FireflyContext } from '../types.js'
import RedPacketDialog from './RedPacketDialog.js'
import { RedPacketMainDialog } from './MainDialog.js'

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

    const [status, setStatus] = useState(false)
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.toggleRedPacketDialog = () => {
            setStatus((v) => !v)
        }
    }, [])

    if (!open) return null
    return (
        <EVMWeb3ContextProvider>
            <CompositionTypeContext value={compositionType}>
                {status ?
                    <RedPacketDialog open onClose={handleClose} source={source} fireflyContext={fireflyContext} />
                :   <RedPacketMainDialog open onClose={handleClose} />}
            </CompositionTypeContext>
        </EVMWeb3ContextProvider>
    )
}
