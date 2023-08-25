import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages, PluginID } from '@masknet/shared-base'
import { base } from '../base.js'
import { GoPlusGlobalInjection } from './GoPlusGlobalInjection.js'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { useTelemetry } from '@masknet/web3-hooks-base'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    GlobalInjection: GoPlusGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.SecurityChecker size={36} />
            const name = <Trans ns={PluginID.GoPlusSecurity} i18nKey="__plugin_name" />
            const telemetry = useTelemetry()
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
                                telemetry.captureEvent(EventType.Access, EventID.EntryAppCheckOpen)
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
