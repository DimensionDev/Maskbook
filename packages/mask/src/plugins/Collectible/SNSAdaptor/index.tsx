import { uniq } from 'lodash-unified'
import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { PLUGIN_ID } from '../constants'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { NFTPage } from './NFTPage'
import { AddressName, AddressNameType } from '@masknet/web3-shared-evm'

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
                TabContent: ({ addressNames = [] }) => <NFTPage addressNames={addressNames as AddressName[]} />,
            },
            Utils: {
                addressNameSorter: (a, z) => {
                    if (a.type === AddressNameType.ENS) return -1
                    if (z.type === AddressNameType.ENS) return 1

                    if (a.type === AddressNameType.UNS) return -1
                    if (z.type === AddressNameType.UNS) return 1

                    if (a.type === AddressNameType.DNS) return -1
                    if (z.type === AddressNameType.DNS) return 1

                    if (a.type === AddressNameType.RSS3) return -1
                    if (z.type === AddressNameType.RSS3) return 1

                    if (a.type === AddressNameType.ADDRESS) return -1
                    if (z.type === AddressNameType.ADDRESS) return 1

                    if (a.type === AddressNameType.GUN) return -1
                    if (z.type === AddressNameType.GUN) return 1

                    if (a.type === AddressNameType.THE_GRAPH) return -1
                    if (z.type === AddressNameType.THE_GRAPH) return 1

                    return 0
                },
                shouldDisplay: (identity, addressNames) => {
                    return !!addressNames?.length
                },
            },
        },
    ],
}

export default sns
