import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { Trans } from 'react-i18next'
import { setupContext } from './context.js'
import CheckSecurityConfirmDialog from './components/CheckSecurityConfirmDialog.js'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { CheckSecurityDialog } from './CheckSecurityDialog.js'
import { RiskWarningDialog } from './components/RiskWarningDialog.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection: function Component() {
        return (
            <>
                <CheckSecurityConfirmDialog />
                <CheckSecurityDialog />
                <RiskWarningDialog />
            </>
        )
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.SecurityChecker size={36} />
            const name = { i18nKey: '__plugin_name', fallback: 'Check Security' }

            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    return (
                        <ApplicationEntry
                            title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                            disabled={disabled}
                            icon={icon}
                            onClick={() =>
                                CrossIsolationMessages.events.requestCheckSecurityDialog.sendToAll({
                                    open: true,
                                    searchHidden: false,
                                })
                            }
                        />
                    )
                },
                name,
                icon,
                appBoardSortingDefaultPriority: 14,
                category: 'dapp',
                marketListSortingPriority: 16,
                description: <Trans i18nKey="plugin_goPlusSecurity_description" />,
            }
        })(),
    ],
}

export default sns
