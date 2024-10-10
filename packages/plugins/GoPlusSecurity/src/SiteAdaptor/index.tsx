import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginTransFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { base } from '../base.js'
import { GoPlusGlobalInjection } from './GoPlusGlobalInjection.js'
import { onConfirm } from './components/CheckSecurityConfirmDialog.js'
import { Trans } from '@lingui/macro'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {
        onConfirm.f = () => context.setMinimalMode(true)
    },
    GlobalInjection: GoPlusGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.SecurityChecker size={36} />
            const name = <Trans>Check Security</Trans>
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    return (
                        <ApplicationEntry
                            title={<PluginTransFieldRender field={name} pluginID={base.ID} />}
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
                description: <Trans>Provide you with fast, reliable and convenient security services.</Trans>,
            }
        })(),
    ],
}

export default site
