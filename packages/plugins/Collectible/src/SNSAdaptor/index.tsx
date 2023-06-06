import { useCallback } from 'react'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import {
    SNSAdaptorContext,
    usePluginWrapper,
    usePostInfoDetails,
    type Plugin,
} from '@masknet/plugin-infra/content-script'
import { CollectionList, UserAssetsProvider } from '@masknet/shared'
import { Box } from '@mui/material'
import { CrossIsolationMessages, NetworkPluginID, SocialAddressType, parseURLs } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EventID } from '@masknet/web3-telemetry/types'
import { Web3ContextProvider, useMountReport } from '@masknet/web3-hooks-base'
import { SNSAdaptorPluginContext } from '@masknet/web3-providers'
import { SearchResultType } from '@masknet/web3-shared-base'
import { base } from '../base.js'
import { PLUGIN_ID, PLUGIN_NAME } from '../constants.js'
import { setupContext } from '../context.js'
import { getPayloadFromURLs } from '../helpers/index.js'
import { DialogInspector } from './DialogInspector.js'
import { PostInspector } from './PostInspector.js'

function useInspectCollectible(pluginID?: NetworkPluginID) {
    return useCallback(
        function inspectCollectible(asset: Web3Helper.NonFungibleAssetAll) {
            if (!pluginID) return
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
const TabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_nfts`,
    label: 'NFTs',
    priority: 4,
    UI: {
        TabContent({ socialAccount }) {
            useMountReport(EventID.AccessWeb3TabNFTsTab)
            const inspectCollectible = useInspectCollectible(socialAccount?.pluginID)
            if (!socialAccount) return null
            return (
                <SNSAdaptorContext.Provider value={SNSAdaptorPluginContext.context}>
                    <Web3ContextProvider value={{ pluginID: socialAccount.pluginID }}>
                        <UserAssetsProvider pluginID={socialAccount.pluginID} address={socialAccount.address}>
                            <CollectionList
                                account={socialAccount.address}
                                pluginID={socialAccount.pluginID}
                                gridProps={gridProps}
                                onItemClick={inspectCollectible}
                            />
                        </UserAssetsProvider>
                    </Web3ContextProvider>
                </SNSAdaptorContext.Provider>
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

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        SNSAdaptorPluginContext.setup(context)

        setupContext(context)
    },
    GlobalInjection() {
        return (
            <SNSAdaptorContext.Provider value={SNSAdaptorPluginContext.context}>
                <DialogInspector />
            </SNSAdaptorContext.Provider>
        )
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
                    useMountReport(EventID.AccessWeb3ProfileDialogNFTsTab)
                    const inspectCollectible = useInspectCollectible(socialAccount?.pluginID)

                    if (!socialAccount) return null

                    return (
                        <SNSAdaptorContext.Provider value={SNSAdaptorPluginContext.context}>
                            <Web3ContextProvider value={{ pluginID: socialAccount.pluginID }}>
                                <UserAssetsProvider pluginID={socialAccount.pluginID} address={socialAccount.address}>
                                    <CollectionList
                                        height={392}
                                        account={socialAccount.address}
                                        pluginID={socialAccount.pluginID}
                                        gridProps={gridProps}
                                        disableWindowScroll
                                        onItemClick={inspectCollectible}
                                    />
                                </UserAssetsProvider>
                            </Web3ContextProvider>
                        </SNSAdaptorContext.Provider>
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
                            result.type === SearchResultType.Domain
                                ? result.keyword
                                : result.type === SearchResultType.EOA
                                ? result.domain ?? ''
                                : '',
                        supportedAddressTypes: [SocialAddressType.ENS],
                    }
                    const inspectCollectible = useInspectCollectible(socialAccount?.pluginID)

                    return (
                        <SNSAdaptorContext.Provider value={SNSAdaptorPluginContext.context}>
                            <Box style={{ minHeight: 300 }}>
                                <Web3ContextProvider value={{ pluginID: result.pluginID }}>
                                    <UserAssetsProvider pluginID={result.pluginID} address={socialAccount.address}>
                                        <CollectionList
                                            height={479}
                                            account={socialAccount.address}
                                            pluginID={socialAccount.pluginID}
                                            gridProps={gridProps}
                                            disableWindowScroll
                                            onItemClick={inspectCollectible}
                                        />
                                    </UserAssetsProvider>
                                </Web3ContextProvider>
                            </Box>
                        </SNSAdaptorContext.Provider>
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
            description: <Trans i18nKey="plugin_collectibles_description" />,
            name: <Trans i18nKey="plugin_collectibles_name" />,
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

export default sns
