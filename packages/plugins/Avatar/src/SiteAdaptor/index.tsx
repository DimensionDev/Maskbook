import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { type Plugin, PluginTransFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { Telemetry } from '@masknet/web3-telemetry'
import { NFTAvatarDialog } from '../Application/NFTAvatarDialog.js'
import { base } from '../base.js'

const NAME_FIELD = {
    fallback: 'NFT PFP',
}

const ICON = <Icons.NFTAvatar size={36} />

const RECOMMEND_FEATURE = {
    description: <Trans i18nKey="plugin_nft_avatar_recommend_feature_description" />,
    backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
}

function clickHandler() {
    CrossIsolationMessages.events.avatarSettingsDialogEvent.sendToLocal({
        open: true,
    })
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection() {
        const { pluginID } = useNetworkContext()
        const { chainId } = useChainContext()
        const [picking, setPicking] = useState<boolean>()
        const [open, setOpen] = useState(false)

        useEffect(() => {
            return CrossIsolationMessages.events.avatarSettingsDialogEvent.on(({ open, startPicking }) => {
                setOpen(open)
                setPicking(startPicking)
            })
        }, [])

        if (!open) return null

        return (
            <Web3ContextProvider network={pluginID} chainId={chainId}>
                <NFTAvatarDialog open startPicking={!!picking} onClose={() => setOpen(false)} />
            </Web3ContextProvider>
        )
    },
    ApplicationEntries: [
        (() => {
            return {
                RenderEntryComponent(EntryComponentProps) {
                    return (
                        <ApplicationEntry
                            title={<PluginTransFieldRender field={NAME_FIELD} pluginID={base.ID} />}
                            icon={ICON}
                            recommendFeature={RECOMMEND_FEATURE}
                            {...EntryComponentProps}
                            onClick={() => {
                                EntryComponentProps.onClick ?
                                    EntryComponentProps.onClick?.(clickHandler)
                                :   clickHandler()
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
                name: NAME_FIELD,
                icon: ICON,
                ApplicationEntryID: base.ID,
                nextIdRequired: true,
                recommendFeature: RECOMMEND_FEATURE,
            }
        })(),
    ],
}

export default site
