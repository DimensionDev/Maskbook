import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { CrossBridgeIcon } from '@masknet/icons'
import { base } from '../base'
import { useState } from 'react'
import { CrossChainBridgeDialog } from './CrossChainBridgeDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled, icon, title }) {
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <ApplicationEntry title={title} disabled={disabled} icon={icon} onClick={() => setOpen(true)} />
                        <CrossChainBridgeDialog open={open} onClose={() => setOpen(false)} />
                    </>
                )
            },
            appBoardSortingDefaultPriority: 5,
            name: { i18nKey: '__plugin_name', fallback: 'Cross-bridge' },
            icon: <CrossBridgeIcon />,
        },
    ],
}

export default sns
