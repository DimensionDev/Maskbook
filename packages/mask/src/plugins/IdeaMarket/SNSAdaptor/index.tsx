import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { uniq } from 'lodash-unified'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { base } from '../base'
import { checkUrl, getAssetInfoFromURL } from '../utils'
import { IdeaMarketView } from './IdeaMarketView'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)

        if (!asset?.market_name || !asset?.idea_name) return null

        return <Renderer marketName={asset?.market_name} ideaName={asset?.idea_name} />
    },
}

export default sns

function Renderer(props: { marketName: string; ideaName: string }) {
    return (
        <MaskPluginWrapper pluginName="IdeaMarket">
            <EthereumChainBoundary chainId={ChainId.Arbitrum}>
                <IdeaMarketView marketName={props.marketName} ideaName={props.ideaName} />
            </EthereumChainBoundary>
        </MaskPluginWrapper>
    )
}
