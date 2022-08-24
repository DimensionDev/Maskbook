import { uniq } from 'lodash-unified'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { PLUGIN_ID, PLUGIN_WRAPPER_TITLE } from '../constants'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { NFTPage } from './NFTPage'
import { NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'
import { setupContext } from '../context'

const NFTTab: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_nfts`,
    label: 'NFTs',
    priority: 1,
    UI: {
        TabContent({ socialAddress, identity }) {
            return <NFTPage socialAddress={socialAddress} identity={identity} />
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
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)
        usePluginWrapper(!!asset)
        return asset ? <PostInspector payload={asset} /> : null
    },
    DecryptedInspector: function Component(props) {
        const collectibleUrl = getRelevantUrl(
            extractTextFromTypedMessage(props.message, { linkAsText: true }).unwrapOr(''),
        )
        const asset = getAssetInfoFromURL(collectibleUrl)
        usePluginWrapper(!!asset)
        return asset ? <PostInspector payload={asset} /> : null
    },
    ProfileTabs: [NFTTab],
    ProfileCardTabs: [
        {
            ...NFTTab,
            priority: 2,
            UI: {
                TabContent({ socialAddress, identity }) {
                    return <NFTPage socialAddress={socialAddress} identity={identity} disableSidebar />
                },
            },
            Utils: {
                ...NFTTab.Utils,
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
        title: PLUGIN_WRAPPER_TITLE,
        icon: <Icons.ApplicationNFT size={24} />,
    },
}

export default sns
