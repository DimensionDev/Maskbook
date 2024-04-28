import { useState } from 'react'
import { Trans } from 'react-i18next'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PluginTransFieldRender } from '@masknet/plugin-infra/content-script'
import { Web3ContextProvider, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID, PluginID } from '@masknet/shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { base } from '../base.js'
import { ApprovalDialog } from './ApprovalDialog.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Approval size={36} />
            const name = <Trans ns={PluginID.Approval} i18nKey="plugin_name" />
            const iconFilterColor = 'rgba(251, 176, 59, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    const { pluginID } = useNetworkContext()
                    const clickHandler = () => setOpen(true)
                    return (
                        <>
                            <ApplicationEntry
                                {...EntryComponentProps}
                                title={<PluginTransFieldRender field={name} pluginID={base.ID} />}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={() => {
                                    EntryComponentProps.onClick ?
                                        EntryComponentProps.onClick(clickHandler, NetworkPluginID.PLUGIN_EVM)
                                    :   clickHandler()
                                    Telemetry.captureEvent(EventType.Access, EventID.EntryAppApprovalOpen)
                                }}
                            />
                            {open ?
                                <Web3ContextProvider network={pluginID}>
                                    <ApprovalDialog open onClose={() => setOpen(false)} />
                                </Web3ContextProvider>
                            :   null}
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 11,
                icon,
                name,
                iconFilterColor,
            }
        })(),
    ],
}

export default site
