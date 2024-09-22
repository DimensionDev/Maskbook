import { Icons } from '@masknet/icons'
import { usePluginWrapper, usePostInfoDetails, type Plugin } from '@masknet/plugin-infra/content-script'
import { CollectionList, UserAssetsProvider } from '@masknet/shared'
import { CrossIsolationMessages, NetworkPluginID, SocialAddressType, parseURLs } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { SearchResultType } from '@masknet/web3-shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Box } from '@mui/material'
import { useCallback } from 'react'
import { base } from '../base.js'
import { PLUGIN_ID, PLUGIN_NAME } from '../constants.js'
import { getPayloadFromURLs } from '../helpers/index.js'
import { DialogInspector } from './DialogInspector.js'
import { PostInspector } from './PostInspector.js'
import { Trans } from '@lingui/macro'

function useInspectCollectible(pluginID?: NetworkPluginID) {
    return useCallback(
        function inspectCollectible(asset: Web3Helper.NonFungibleAssetAll, from?: 'web3Profile' | 'profileCard') {
            if (!pluginID) return
            if (from === 'web3Profile') Telemetry.captureEvent(EventType.Interact, EventID.EntryProfileUserNftsClickNft)
            else if (from === 'profileCard')
                Telemetry.captureEvent(EventType.Interact, EventID.EntryTimelineHoverUserNftClickNft)
            CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
                open: true,
                chainId: asset.chainId,
                pluginID,
                tokenId: asset.tokenId,
                tokenAddress: asset.address,
            })
        },
        [pluginID],
    )
}

const gridProps = {
    columns: 'repeat(auto-fill, minmax(20%, 1fr))',
}
const usePopupCollectionStyles = makeStyles()({
    sidebar: {
        paddingBottom: 48,
    },
})
const TabConfig: Plugin.SiteAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_nfts`,
    label: 'NFTs',
    priority: 4,
    UI: {
        TabContent({ socialAccount }) {
            const inspectCollectible = useInspectCollectible(socialAccount?.pluginID)
            if (!socialAccount) return null
            return (
                <Web3ContextProvider network={socialAccount.pluginID}>
                    <UserAssetsProvider pluginID={socialAccount.pluginID} account={socialAccount.address}>
                        <CollectionList
                            gridProps={gridProps}
                            from="web3Profile"
                            onItemClick={(asset) => inspectCollectible(asset, 'web3Profile')}
                        />
                    </UserAssetsProvider>
                </Web3ContextProvider>
            )
        },
    },
    Utils: {
        sorter: (a, z) => {
            if (a.supportedAddressTypes?.includes(SocialAddressType.ENS)) return -1
            if (z.supportedAddressTypes?.includes(SocialAddressType.ENS)) return 1

            if (a.supportedAddressTypes?.includes(SocialAddressType.RSS3)) return -1
            if (z.supportedAddressTypes?.includes(SocialAddressType.RSS3)) return 1

            if (a.supportedAddressTypes?.includes(SocialAddressType.Address)) return -1
            if (z.supportedAddressTypes?.includes(SocialAddressType.Address)) return 1

            return 0
        },
    },
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection() {
        return <DialogInspector />
    },
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()
        const payload = getPayloadFromURLs(links)
        usePluginWrapper(!!payload)
        return payload ? <PostInspector payload={payload} /> : null
    },
    DecryptedInspector(props) {
        const links = parseURLs(extractTextFromTypedMessage(props.message, { linkAsText: true }).unwrapOr(''))
        const payload = getPayloadFromURLs(links)
        usePluginWrapper(!!payload)
        return payload ? <PostInspector payload={payload} /> : null
    },
    ProfileTabs: [TabConfig],
    ProfileCardTabs: [
        {
            ...TabConfig,
            priority: 4,
            UI: {
                TabContent({ socialAccount }) {
                    const inspectCollectible = useInspectCollectible(socialAccount?.pluginID)
                    const { classes } = usePopupCollectionStyles()

                    if (!socialAccount) return null

                    return (
                        <Web3ContextProvider network={socialAccount.pluginID}>
                            <UserAssetsProvider pluginID={socialAccount.pluginID} account={socialAccount.address}>
                                <CollectionList
                                    height={392}
                                    gridProps={gridProps}
                                    classes={{ sidebar: classes.sidebar }}
                                    disableWindowScroll
                                    from="profileCard"
                                    onItemClick={(asset) => inspectCollectible(asset, 'profileCard')}
                                />
                            </UserAssetsProvider>
                        </Web3ContextProvider>
                    )
                },
            },
            Utils: {
                ...TabConfig.Utils,
                shouldDisplay(identity, socialAccount) {
                    return socialAccount?.pluginID === NetworkPluginID.PLUGIN_EVM
                },
            },
        },
    ],
    SearchResultTabs: [
        {
            ...TabConfig,
            priority: 4,
            UI: {
                TabContent({ result }) {
                    const socialAccount = {
                        pluginID: NetworkPluginID.PLUGIN_EVM,
                        address: result.type === SearchResultType.Domain ? result.address ?? '' : result.keyword,
                        label:
                            result.type === SearchResultType.Domain ? result.keyword
                            : result.type === SearchResultType.EOA ? result.domain ?? ''
                            : '',
                        supportedAddressTypes: [SocialAddressType.ENS],
                    }
                    const inspectCollectible = useInspectCollectible(socialAccount.pluginID)

                    return (
                        <Box style={{ minHeight: 300 }}>
                            <Web3ContextProvider network={result.pluginID}>
                                <UserAssetsProvider pluginID={result.pluginID} account={socialAccount.address}>
                                    <CollectionList
                                        height={478}
                                        gridProps={gridProps}
                                        disableWindowScroll
                                        onItemClick={inspectCollectible}
                                    />
                                </UserAssetsProvider>
                            </Web3ContextProvider>
                        </Box>
                    )
                },
            },
            Utils: {
                ...TabConfig.Utils,
                shouldDisplay(result) {
                    return [SearchResultType.Domain, SearchResultType.EOA].includes(result.type)
                },
            },
        },
    ],
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: (
                <Trans>
                    Display specific information of collectibles in OpenSea and Rarible, make an offer directly on
                    social media.
                </Trans>
            ),
            name: <Trans>Collectibles</Trans>,
            icon: <Icons.Collectibles size={36} />,
            marketListSortingPriority: 7,
            tutorialLink: 'https://realmasknetwork.notion.site/c388746f11774ecfa17914c900d3ed97',
        },
    ],
    wrapperProps: {
        title: PLUGIN_NAME,
        icon: <Icons.ApplicationNFT size={24} />,
    },
}

export default site
