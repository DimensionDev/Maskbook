import { uniq } from 'lodash-unified'
import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { PLUGIN_ID } from '../constants'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { NFTPage } from './NFTPage'
import { Trans } from 'react-i18next'
import { CollectiblesIcon } from '@masknet/icons'
import { IdentityAddress, IdentityAddressType } from '@masknet/web3-shared-base'

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
                TabContent: ({ addressNames = [] }) => <NFTPage addressNames={addressNames as IdentityAddress[]} />,
            },
            Utils: {
                addressNameSorter: (a, z) => {
                    if (a.type === IdentityAddressType.ENS) return -1
                    if (z.type === IdentityAddressType.ENS) return 1

                    if (a.type === IdentityAddressType.UNS) return -1
                    if (z.type === IdentityAddressType.UNS) return 1

                    if (a.type === IdentityAddressType.DNS) return -1
                    if (z.type === IdentityAddressType.DNS) return 1

                    if (a.type === IdentityAddressType.RSS3) return -1
                    if (z.type === IdentityAddressType.RSS3) return 1

                    if (a.type === IdentityAddressType.ADDRESS) return -1
                    if (z.type === IdentityAddressType.ADDRESS) return 1

                    if (a.type === IdentityAddressType.GUN) return -1
                    if (z.type === IdentityAddressType.GUN) return 1

                    if (a.type === IdentityAddressType.THE_GRAPH) return -1
                    if (z.type === IdentityAddressType.THE_GRAPH) return 1

                    return 0
                },
                shouldDisplay: (identity, addressNames) => {
                    return !!addressNames?.length
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
            icon: <CollectiblesIcon />,
            marketListSortingPriority: 7,
            tutorialLink: 'https://realmasknetwork.notion.site/c388746f11774ecfa17914c900d3ed97',
        },
    ],
}

export default sns
