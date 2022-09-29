import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { Box } from '@mui/material'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { PluginIDContextProvider } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'
import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { PostInspector } from './PostInspector.js'
import { base } from '../base.js'
import { getPayloadFromURL, getPayloadFromURLs } from '../helpers/index.js'
import { setupContext } from '../context.js'
import { PLUGIN_ID, PLUGIN_NAME } from '../constants.js'
import { DialogInspector } from './DialogInspector.js'
import { CollectionList } from './List/CollectionList.js'

const TabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_nfts`,
    label: 'NFTs',
    priority: 1,
    UI: {
        TabContent({ socialAddress, identity }) {
            if (!socialAddress) return null
            return (
                <PluginIDContextProvider value={socialAddress.networkSupporterPluginID}>
                    <CollectionList socialAddress={socialAddress} persona={identity?.publicKey} profile={identity} />
                </PluginIDContextProvider>
            )
        },
    },
    Utils: {
        sorter: (a, z) => {
            if (a.type === SocialAddressType.ENS) return -1
            if (z.type === SocialAddressType.ENS) return 1

            if (a.type === SocialAddressType.UNS) return -1
            if (z.type === SocialAddressType.UNS) return 1

            if (a.type === SocialAddressType.DNS) return -1
            if (z.type === SocialAddressType.DNS) return 1

            if (a.type === SocialAddressType.RSS3) return -1
            if (z.type === SocialAddressType.RSS3) return 1

            if (a.type === SocialAddressType.ADDRESS) return -1
            if (z.type === SocialAddressType.ADDRESS) return 1

            if (a.type === SocialAddressType.GUN) return -1
            if (z.type === SocialAddressType.GUN) return 1

            if (a.type === SocialAddressType.THE_GRAPH) return -1
            if (z.type === SocialAddressType.THE_GRAPH) return 1

            return 0
        },
    },
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection() {
        return (
            <>
                <DialogInspector />
            </>
        )
    },
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()
        const payload = getPayloadFromURLs(links)
        usePluginWrapper(!!payload)
        return payload ? <PostInspector payload={payload} /> : null
    },
    DecryptedInspector(props) {
        const payload = getPayloadFromURL(extractTextFromTypedMessage(props.message, { linkAsText: true }).unwrapOr(''))
        usePluginWrapper(!!payload)
        return payload ? <PostInspector payload={payload} /> : null
    },
    ProfileTabs: [TabConfig],
    ProfileCardTabs: [
        {
            ...TabConfig,
            priority: 2,
            UI: {
                TabContent({ socialAddress, identity }) {
                    if (!socialAddress) return null
                    return (
                        <Box pr={1.5}>
                            <PluginIDContextProvider value={socialAddress.networkSupporterPluginID}>
                                <CollectionList
                                    socialAddress={socialAddress}
                                    persona={identity?.publicKey}
                                    profile={identity}
                                />
                            </PluginIDContextProvider>
                        </Box>
                    )
                },
            },
            Utils: {
                ...TabConfig.Utils,
                shouldDisplay(identity, socialAddress) {
                    return socialAddress?.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM
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
