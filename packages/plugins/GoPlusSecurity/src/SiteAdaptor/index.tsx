import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages, PluginID } from '@masknet/shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { base } from '../base.js'
import { GoPlusGlobalInjection } from './GoPlusGlobalInjection.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection: GoPlusGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.SecurityChecker size={36} />
            const name = <Trans ns={PluginID.GoPlusSecurity} i18nKey="__plugin_name" />
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    return (
                        <ApplicationEntry
                            title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                            disabled={disabled}
                            icon={icon}
                            onClick={() => {
                                CrossIsolationMessages.events.checkSecurityDialogEvent.sendToLocal({
                                    open: true,
                                    searchHidden: false,
                                })
                                Telemetry.captureEvent(EventType.Access, EventID.EntryAppCheckOpen)
                            }}
                        />
                    )
                },
                name,
                icon,
                appBoardSortingDefaultPriority: 12,
                category: 'dapp',
                marketListSortingPriority: 16,
                description: <Trans i18nKey="plugin_goPlusSecurity_description" />,
            }
        })(),
    ],
}

export default site
