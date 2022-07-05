import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Web3ProfileIcon } from '@masknet/icons'
import { base } from '../base'
import { Web3ProfileDialog } from './components/Web3ProfileDialog'
import { setupContext } from './context'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { Trans } from 'react-i18next'
import { CrossIsolationMessages } from '@masknet/shared-base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection: function Component() {
        return <Web3ProfileDialog />
    },
    ApplicationEntries: [
        (() => {
            const icon = <Web3ProfileIcon />
            const name = { i18nKey: '__plugin_name', fallback: 'Web3 Profile' }
            const recommendFeature = {
                description: <Trans i18nKey="plugin_web3_profile_recommend_feature_description" />,
                backgroundGradient: 'linear-gradient(181.28deg, #6BA3FF 1.76%, #C2E9FB 99.59%)',
            }
            return {
                RenderEntryComponent(EntryComponentProps) {
                    return (
                        <>
                            <ApplicationEntry
                                {...EntryComponentProps}
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                icon={icon}
                                recommendFeature={recommendFeature}
                                onClick={() =>
                                    CrossIsolationMessages.events.requestWeb3ProfileDialog.sendToAll({ open: true })
                                }
                            />
                        </>
                    )
                },
                ApplicationEntryID: base.ID,
                appBoardSortingDefaultPriority: 3,
                marketListSortingPriority: 3,
                name,
                icon,
                nextIdRequired: true,
                category: 'dapp',
                recommendFeature,
                description: {
                    i18nKey: '__plugin_description',
                    fallback: 'Choose and showcase your Web3 footprints on Twitter.',
                },
            }
        })(),
    ],
}

export default sns
