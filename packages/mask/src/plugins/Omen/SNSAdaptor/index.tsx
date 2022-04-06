import { useMemo } from 'react'
import { parseURL } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra'
import { base } from '../base'
import { OmenView } from '../UI/OmenView'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const regexLinkPattern = /^https:\/\/omen.eth.link\/#\/(0x\w+)/
const isOmenURL = (link: string) => regexLinkPattern.test(link)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isOmenURL)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails.mentionedLinks().find(isOmenURL)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [, id] = props.url.match(regexLinkPattern) ?? []
    usePluginWrapper(true)
    return (
        <EthereumChainBoundary chainId={ChainId.xDai}>
            <OmenView id={id} />
        </EthereumChainBoundary>
    )
}

export default sns
