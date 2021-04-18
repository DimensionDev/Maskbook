import { PluginConfig, PluginScope, PluginStage } from '../types'
import { PLUGIN_NAME, PLUGIN_IDENTIFIER } from './constants'
import { PostInspector } from './UI/PostInspector'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import type { CollectibleJSON_Payload } from './types'
import { getRelevantUrl, checkUrl, getAssetInfoFromURL } from './utils'
import { getTypedMessageContent } from '../../protocols/typed-message'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { uniq } from 'lodash-es'
import { MakeOfferDialog } from './UI/MakeOfferDialog'
import { ChainState } from '../../web3/state/useChainState'
import { PostListingDialog } from './UI/PostListingDialog'

export const CollectiblesPluginDefine: PluginConfig = {
    id: PLUGIN_IDENTIFIER,
    pluginIcon: '🖼️',
    pluginName: PLUGIN_NAME,
    pluginDescription: 'An NFT collectible viewer.',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Component(props) {
        // const payload = CollectibleMetadataReader(props.message.meta)
        // if (!payload.ok) return null
        const collectibleUrl = getRelevantUrl(getTypedMessageContent(props.message))
        const asset = getAssetInfoFromURL(collectibleUrl)
        return asset ? renderPostInspector(asset) : null
    },
    postInspector: function Component() {
        const link = uniq(
            usePostInfoDetails('postMetadataMentionedLinks').concat(usePostInfoDetails('postMentionedLinks')),
        ).find(checkUrl)
        const asset = getAssetInfoFromURL(link)

        return asset ? renderPostInspector(asset) : null
    },
    PageComponent() {
        return (
            <ChainState.Provider>
                <MakeOfferDialog />
                <PostListingDialog />
                {/* <MakeOfferDialog />
                <PlaceBidDialog /> */}
            </ChainState.Provider>
        )
    },
}

function renderPostInspector(payload: CollectibleJSON_Payload) {
    return (
        <MaskbookPluginWrapper pluginName="Collectible">
            <PostInspector payload={payload} />
        </MaskbookPluginWrapper>
    )
}
