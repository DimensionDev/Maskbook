import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { useState } from 'react'
import { CrossChainBridgeDialog } from './CrossChainBridgeDialog.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    ApplicationEntries: [
        (() => {
            const icon = <Icons.CrossBridge size={36} />
            const name = { i18nKey: '__plugin_name', fallback: 'Cross-chain' }
            const iconFilterColor = 'rgba(183, 212, 255, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    const clickHandler = () => setOpen(true)
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                {...EntryComponentProps}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={
                                    EntryComponentProps.onClick
                                        ? () => EntryComponentProps.onClick?.(clickHandler)
                                        : clickHandler
                                }
                            />
                            <CrossChainBridgeDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 5,
                name,
                icon,
                iconFilterColor,
            }
        })(),
    ],
}

export default sns
