import { Icons } from '@masknet/icons'
import { Plugin, PluginI18NFieldRender, SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { PluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { Trans } from 'react-i18next'
import { NFTAvatarDialog } from '../Application/NFTAvatarsDialog.js'
import { base } from '../base.js'
import { setupContext } from '../context.js'
import { SharedContextSettings } from '../settings.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
        SharedContextSettings.value = context
    },
    GlobalInjection() {
        const { pluginID } = useNetworkContext()
        const { chainId } = useChainContext()
        return (
            <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
                <Web3ContextProvider value={{ pluginID, chainId }}>
                    <NFTAvatarDialog />
                </Web3ContextProvider>
            </SNSAdaptorContext.Provider>
        )
    },
    ApplicationEntries: [
        (() => {
            const name = { fallback: 'NFT PFP' }
            const icon = <Icons.NFTAvatar size={36} />
            const recommendFeature = {
                description: <Trans i18nKey="plugin_nft_avatar_recommend_feature_description" />,
                backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
            }
            return {
                RenderEntryComponent(EntryComponentProps) {
                    const clickHandler = () => {
                        CrossIsolationMessages.events.applicationDialogEvent.sendToLocal({
                            open: true,
                            pluginID: PluginID.Avatar,
                        })
                    }
                    return (
                        <ApplicationEntry
                            title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                            icon={icon}
                            recommendFeature={recommendFeature}
                            {...EntryComponentProps}
                            onClick={
                                EntryComponentProps.onClick
                                    ? () => EntryComponentProps.onClick?.(clickHandler)
                                    : clickHandler
                            }
                            tooltipHint={
                                EntryComponentProps.tooltipHint ??
                                (EntryComponentProps.disabled ? undefined : <Trans i18nKey="application_hint" />)
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 3,
                name,
                icon,
                ApplicationEntryID: base.ID,
                nextIdRequired: true,
                recommendFeature,
            }
        })(),
    ],
}

export * from './NFTAvatar.js'
export * from './NFTAvatarButton.js'
export * from './NFTAvatarClip.js'
export * from './NFTAvatarRing.js'
export * from './NFTBadge.js'
export * from './NFTBadgeTimeline.js'
export * from './NFTBadgeTweet.js'
export * from './NFTImage.js'
export * from './RainbowBox.js'

export default sns
