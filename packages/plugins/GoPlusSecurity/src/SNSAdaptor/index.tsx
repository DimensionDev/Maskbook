import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages, PluginID } from '@masknet/shared-base'
import { base } from '../base.js'
import { GoPlusGlobalInjection } from './GoPlusGlobalInjection.js'

const sns: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {},
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
                            onClick={() =>
                                CrossIsolationMessages.events.checkSecurityDialogEvent.sendToLocal({
                                    open: true,
                                    searchHidden: false,
                                })
                            }
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

export default sns
