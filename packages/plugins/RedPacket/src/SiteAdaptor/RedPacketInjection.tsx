import { CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import { useCallback, useEffect, useState } from 'react'

import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { RedPacketMainDialog } from './MainDialog.js'
import { CompositionTypeContext } from './contexts/CompositionTypeContext.js'
import { useEnvironmentContext } from '@masknet/web3-hooks-base'
import { SolRedPacketMainDialog } from './SolanaRedpacketDialog/MainDialog.js'

export function RedPacketInjection() {
    const [open, setOpen] = useState(false)
    const [compositionType, setCompositionType] = useState<CompositionType>('timeline')
    const { pluginID } = useEnvironmentContext()
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
        <CompositionTypeContext value={compositionType}>
            {pluginID === NetworkPluginID.PLUGIN_SOLANA ?
                <SolRedPacketMainDialog open={open} onClose={handleClose} />
            :   <RedPacketMainDialog open={open} onClose={handleClose} />}
        </CompositionTypeContext>
    )
}
