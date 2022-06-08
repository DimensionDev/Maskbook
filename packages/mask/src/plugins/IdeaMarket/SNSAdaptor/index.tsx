import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { uniq } from 'lodash-unified'
import { useMemo } from 'react'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { base } from '../base'
import { checkUrl } from '../utils'
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
        if (!link) return null

        return <Renderer />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)
        if (!link) return null

        return <Renderer />
    },
}

export default sns

function Renderer() {
    usePluginWrapper(true)
    return (
        <EthereumChainBoundary chainId={ChainId.Arbitrum}>
            <IdeaMarketView />
        </EthereumChainBoundary>
    )
}
