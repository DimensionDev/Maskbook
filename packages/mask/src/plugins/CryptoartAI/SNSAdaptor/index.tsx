import { uniq } from 'lodash-unified'
import { Trans } from 'react-i18next'
import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { CryptoArt as CryptoArtIcon } from '@masknet/icons'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { extractTextFromTypedMessage } from '@masknet/typed-message'

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
    ApplicationEntries: [
        (() => {
            const icon = <CryptoArtIcon />
            const name = <Trans i18nKey="plugin_cryptoartai_dapp_name" />
            return {
                ApplicationEntryID: base.ID,
                marketListSortingPriority: 19,
                icon,
                category: 'dapp',
                name,
                description: <Trans i18nKey="plugin_cryptoartai_dapp_description" />,
            }
        })(),
    ],
}

export default sns
