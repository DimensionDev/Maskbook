import { uniq } from 'lodash-unified'
import { Trans } from 'react-i18next'
import { Collectibles as CollectiblesIcon } from '@masknet/icons'
import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { PLUGIN_ID } from '../constants'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { NFTPage } from './NFTPage'
import { SocialAddressType } from '@masknet/web3-shared-base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
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
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_nfts`,
            label: 'NFTs',
            priority: 1,
            UI: {
                TabContent: NFTPage,
            },
            Utils: {
                shouldDisplay: (identity, socialAddressList) => {
                    return !!socialAddressList?.length
                },
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
        },
    ],
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans i18nKey="plugin_collectibles_description" />,
            name: <Trans i18nKey="plugin_collectibles_name" />,
            icon: <CollectiblesIcon size={36} />,
            marketListSortingPriority: 7,
            tutorialLink: 'https://realmasknetwork.notion.site/c388746f11774ecfa17914c900d3ed97',
        },
    ],
}

export default sns
