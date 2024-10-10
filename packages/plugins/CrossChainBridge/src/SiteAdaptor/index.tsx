import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PluginTransFieldRender } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { useState } from 'react'
import { CrossChainBridgeDialog } from './CrossChainBridgeDialog.js'
import { Trans } from '@lingui/macro'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.CrossBridge size={36} />
            const name = <Trans>Cross-chain</Trans>
            const iconFilterColor = 'rgba(183, 212, 255, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    const clickHandler = () => setOpen(true)
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginTransFieldRender field={name} pluginID={base.ID} />}
                                {...EntryComponentProps}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={
                                    EntryComponentProps.onClick ?
                                        () => EntryComponentProps.onClick?.(clickHandler)
                                    :   clickHandler
                                }
                            />
                            <CrossChainBridgeDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 9,
                name,
                icon,
                iconFilterColor,
            }
        })(),
    ],
}

export default site
