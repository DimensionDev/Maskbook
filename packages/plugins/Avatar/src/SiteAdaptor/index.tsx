import { useEffect, useState } from 'react'
import { Icons } from '@masknet/icons'
import { type Plugin, PluginTransFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { Telemetry } from '@masknet/web3-telemetry'
import { NFTAvatarDialog } from '../Application/NFTAvatarDialog.js'
import { base } from '../base.js'
import { Trans } from '@lingui/macro'

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
        const [picking, setPicking] = useState(false)
        const [open, setOpen] = useState(false)

        useEffect(() => {
            return CrossIsolationMessages.events.avatarSettingsDialogEvent.on(({ open, startPicking = false }) => {
                setOpen(open)
                setPicking(startPicking)
            })
        }, [])

        if (!open) return null

        return (
            <Web3ContextProvider network={pluginID} chainId={chainId}>
                <NFTAvatarDialog open startPicking={picking} onClose={() => setOpen(false)} />
            </Web3ContextProvider>
        )
    },
    ApplicationEntries: [
        (() => {
            const field = {
                fallback: 'NFT PFP',
            }

            const icon = <Icons.NFTAvatar size={36} />

            const recommendFeature = {
                description: <Trans>Set your NFT as profile picture with exclusive aura.</Trans>,
                backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
            }

            return {
                RenderEntryComponent(EntryComponentProps) {
                    return (
                        <ApplicationEntry
                            title={<PluginTransFieldRender field={field} pluginID={base.ID} />}
                            icon={icon}
                            recommendFeature={recommendFeature}
                            {...EntryComponentProps}
                            onClick={() => {
                                EntryComponentProps.onClick ? EntryComponentProps.onClick(clickHandler) : clickHandler()
                                Telemetry.captureEvent(EventType.Access, EventID.EntryAppNFT_PFP_Open)
                            }}
                            tooltipHint={
                                EntryComponentProps.tooltipHint ??
                                (EntryComponentProps.disabled ? undefined : (
                                    <Trans>
                                        Socialize and show off your NFTs. People can bid, buy and view your valuable
                                        NFTs without leaving Twitter.
                                    </Trans>
                                ))
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 3,
                name: field,
                icon,
                ApplicationEntryID: base.ID,
                nextIdRequired: true,
                recommendFeature,
            }
        })(),
    ],
}

export default site
