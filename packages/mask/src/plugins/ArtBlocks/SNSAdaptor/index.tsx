import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { uniq } from 'lodash-unified'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'

import { base } from '../base'
import { getTypedMessageContent } from '../../../protocols/typed-message'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { PLUGIN_NAME } from '../constants'
import { Collectible } from './Collectible'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import type { ChainId } from '@masknet/web3-shared-evm'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const links = usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks())
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)

        return asset ? <Renderer chainId={asset?.chain_id} projectId={asset.project_id} /> : null
    },
    DecryptedInspector: function Component(props) {
        const collectibleUrl = getRelevantUrl(getTypedMessageContent(props.message))
        const asset = getAssetInfoFromURL(collectibleUrl)
        return asset ? <Renderer chainId={asset.chain_id} projectId={asset.project_id} /> : null
    },
}

function Renderer(props: { chainId: ChainId; projectId: string }) {
    return (
        <MaskPluginWrapper pluginName={PLUGIN_NAME}>
            <EthereumChainBoundary chainId={props.chainId}>
                <Collectible projectId={props.projectId} />
            </EthereumChainBoundary>
        </MaskPluginWrapper>
    )
}

export default sns
