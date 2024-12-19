import { CrossIsolationMessages } from '@masknet/shared-base'
import { createContext, useCallback, useEffect, useState } from 'react'

import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { RedPacketMainDialog } from './MainDialog.js'

export const CompositionTypeContext = createContext<CompositionType>('timeline')

export function RedPacketInjection() {
    const [open, setOpen] = useState(false)
    const [compositionType, setCompositionType] = useState<CompositionType>('timeline')

    useEffect(() => {
        return CrossIsolationMessages.events.redpacketDialogEvent.on(({ open, compositionType = 'timeline' }) => {
            setOpen(open)
            setCompositionType(compositionType)
        })
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    if (!open) return null
    return (
        <EVMWeb3ContextProvider>
            <CompositionTypeContext value={compositionType}>
                <RedPacketMainDialog open onClose={handleClose} />
            </CompositionTypeContext>
        </EVMWeb3ContextProvider>
    )
}
