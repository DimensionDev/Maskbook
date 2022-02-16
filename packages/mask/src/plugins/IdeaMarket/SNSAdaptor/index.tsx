import { Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { uniq } from 'lodash-unified'
import { useMemo } from 'react'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { base } from '../base'
import { checkUrl, getAssetInfoFromURL } from '../utils'
import { IdeaMarketView } from './IdeaMarketView'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const links = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val)
        }, [props.message])
        if (!links) return null
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)
        if (!asset?.market_name || !asset?.idea_name) return null

        return <Renderer marketName={asset?.market_name} ideaName={asset?.idea_name} />
    },
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
    usePluginWrapper(true)
    return (
        <EthereumChainBoundary chainId={ChainId.Arbitrum}>
            <IdeaMarketView marketName={props.marketName} ideaName={props.ideaName} />
        </EthereumChainBoundary>
    )
}
