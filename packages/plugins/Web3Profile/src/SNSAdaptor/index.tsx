import { useEffect } from 'react'
import { Trans } from 'react-i18next'
import { Plugin } from '@masknet/plugin-infra'
import { PluginID, CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { ApplicationEntry, PublicWalletSetting } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { setupContext } from './context.js'
import { Web3ProfileDialog } from './components/Web3ProfileDialog.js'
import { ShadowRootTooltip } from '@masknet/theme'
import { useAsync } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'

const LensIconSizeMap: Record<Plugin.SNSAdaptor.LensSlot, number> = {
    [Plugin.SNSAdaptor.LensSlot.Post]: 18,
    [Plugin.SNSAdaptor.LensSlot.ProfileName]: 20,
    [Plugin.SNSAdaptor.LensSlot.Sidebar]: 16,
}

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
                        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, pluginID }) => {
                            if (pluginID !== PluginID.Web3Profile) return
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
                                        ? EntryComponentProps.onClick()
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
                features: [
                    {
                        name: <Trans i18nKey="plugin_web3_profile_feature_general_user_name" />,
                        description: <Trans i18nKey="plugin_web3_profile_feature_general_user_description" />,
                    },
                    {
                        name: <Trans i18nKey="plugin_web3_profile_feature_nft_name" />,
                        description: <Trans i18nKey="plugin_web3_profile_feature_nft_description" />,
                    },
                ],
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
    Lens: {
        ID: `${base.ID}_lens`,
        UI: {
            Content({ identity, slot, onStatusUpdate }) {
                const { value: data = EMPTY_LIST } = useAsync(async () => {
                    if (!identity?.userId) return
                    return NextIDProof.queryAllLens(identity?.userId)
                }, [identity?.userId])

                const hasLens = !data.length
                useEffect(() => {
                    onStatusUpdate?.(hasLens)
                }, [onStatusUpdate, hasLens])

                if (!data?.length) return null

                return (
                    <ShadowRootTooltip title={data[0].lens}>
                        <Icons.Lens size={LensIconSizeMap[slot]} />
                    </ShadowRootTooltip>
                )
            },
        },
    },
}

export default sns
