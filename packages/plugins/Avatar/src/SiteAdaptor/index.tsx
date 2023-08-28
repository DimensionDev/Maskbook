import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { type Plugin, PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { Telemetry } from '@masknet/web3-telemetry'
import { NFTAvatarDialog } from '../Application/NFTAvatarDialog.js'
import { base } from '../base.js'

function clickHandler() {
    CrossIsolationMessages.events.avatarSettingDialogEvent.sendToLocal({
        open: true,
    })
}
const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    GlobalInjection() {
        const { pluginID } = useNetworkContext()
        const { chainId } = useChainContext()
        const [picking, setPicking] = useState<boolean>()
        const [open, setOpen] = useState(false)
        useEffect(() => {
            return CrossIsolationMessages.events.avatarSettingDialogEvent.on(({ open, startPicking }) => {
                setOpen(open)
                setPicking(startPicking)
            })
        }, [])
        if (!open) return null

        return (
            <Web3ContextProvider value={{ pluginID, chainId }}>
                <NFTAvatarDialog startPicking={!!picking} open={open} onClose={() => setOpen(false)} />
            </Web3ContextProvider>
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
                    return (
                        <ApplicationEntry
                            title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                            icon={icon}
                            recommendFeature={recommendFeature}
                            {...EntryComponentProps}
                            onClick={() => {
                                EntryComponentProps.onClick
                                    ? EntryComponentProps.onClick?.(clickHandler)
                                    : clickHandler()
                                Telemetry.captureEvent(EventType.Access, EventID.EntryAppNFT_PFP_Open)
                            }}
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
export * from './NFTAvatarSquare.js'

export default site
