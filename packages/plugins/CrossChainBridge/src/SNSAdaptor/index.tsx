import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Trans } from 'react-i18next'
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
            name: <Trans i18nKey="plugin_cross_bridge_name" />,
            icon: <CrossBridgeIcon />,
        },
    ],
}

export default sns
