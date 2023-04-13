import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { Box } from '@mui/material'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { useMountReport } from '@masknet/web3-telemetry/hooks'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { SearchResultType } from '@masknet/web3-shared-base'
import { NetworkPluginID, parseURLs, SocialAddressType } from '@masknet/shared-base'
import {
    type Plugin,
    usePostInfoDetails,
    usePluginWrapper,
    SNSAdaptorContext,
} from '@masknet/plugin-infra/content-script'
import { PostInspector } from './PostInspector.js'
import { base } from '../base.js'
import { getPayloadFromURLs } from '../helpers/index.js'
import { SharedContextSettings, setupContext } from '../context.js'
import { PLUGIN_ID, PLUGIN_NAME } from '../constants.js'
import { DialogInspector } from './DialogInspector.js'
import { CollectionList } from './List/CollectionList.js'
import { TelemetryAPI } from '@masknet/web3-providers/types'
import { UserAssetsProvider } from './Context/UserAssetsContext.js'

const TabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_nfts`,
    label: 'NFTs',
    priority: 1,
    UI: {
        TabContent({ socialAccount, identity }) {
            useMountReport(TelemetryAPI.EventID.AccessWeb3TabNFTsTab)
            if (!socialAccount) return null
            return (
                <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
                    <Web3ContextProvider value={{ pluginID: socialAccount.pluginID }}>
                        <UserAssetsProvider
                            pluginID={socialAccount.pluginID}
                            userAddress={socialAccount.address}
                            userId={identity?.identifier?.userId!}
                            persona={identity?.publicKey!}>
                            <CollectionList socialAccount={socialAccount} />
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
        setupContext(context)
        SharedContextSettings.value = context
    },
    GlobalInjection() {
        return (
            <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
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
            priority: 1,
            UI: {
                TabContent({ socialAccount, identity }) {
                    useMountReport(TelemetryAPI.EventID.AccessWeb3ProfileDialogNFTsTab)

                    if (!socialAccount) return null

                    return (
                        <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
                            <Web3ContextProvider value={{ pluginID: socialAccount.pluginID }}>
                                <UserAssetsProvider
                                    pluginID={socialAccount.pluginID}
                                    userAddress={socialAccount.address}
                                    userId={identity?.identifier?.userId!}
                                    persona={identity?.publicKey!}>
                                    <CollectionList socialAccount={socialAccount} />
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
            priority: 1,
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

                    return (
                        <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
                            <Box style={{ minHeight: 300 }}>
                                <Web3ContextProvider value={{ pluginID: result.pluginID }}>
                                    <UserAssetsProvider pluginID={result.pluginID} userAddress={socialAccount.address}>
                                        <CollectionList socialAccount={socialAccount} />
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
