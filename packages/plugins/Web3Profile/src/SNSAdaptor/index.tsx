import { Plugin, PluginID } from '@masknet/plugin-infra'
import { ApplicationEntry, PublicWalletSetting } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { Web3ProfileDialog } from './components/Web3ProfileDialog.js'
import { setupContext } from './context.js'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { Trans } from 'react-i18next'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useEffect } from 'react'

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
            const icon = <Icons.Web3Profile size={36} />
            const name = { i18nKey: '__plugin_name', fallback: 'Web3 Profile' }
            const recommendFeature = {
                description: <Trans i18nKey="plugin_web3_profile_recommend_feature_description" />,
                backgroundGradient: 'linear-gradient(181.28deg, #6BA3FF 1.76%, #C2E9FB 99.59%)',
            }
            return {
                RenderEntryComponent(EntryComponentProps) {
                    useEffect(() => {
                        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, application }) => {
                            if (application !== PluginID.Web3Profile) return
                            CrossIsolationMessages.events.web3ProfileDialogEvent.sendToLocal({ open })
                        })
                    }, [])

                    return (
                        <>
                            <ApplicationEntry
                                {...EntryComponentProps}
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                icon={icon}
                                recommendFeature={recommendFeature}
                                onClick={() =>
                                    EntryComponentProps?.onClick
                                        ? EntryComponentProps?.onClick()
                                        : CrossIsolationMessages.events.web3ProfileDialogEvent.sendToLocal({
                                              open: true,
                                          })
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
    SettingTabs: [
        {
            ID: PluginID.Web3Profile,
            label: 'Web3Profile',
            priority: 2,
            UI: {
                TabContent: PublicWalletSetting,
            },
        },
    ],
}

export default sns
