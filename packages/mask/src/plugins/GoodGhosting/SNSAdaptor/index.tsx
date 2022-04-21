import { useMemo } from 'react'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { PreviewCard } from '../UI/PreviewCard'
import { ChainId } from '@masknet/web3-shared-evm'
import { base } from '../base'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const isGoodGhosting = (x: string): boolean => /^https:\/\/goodghosting.com/.test(x)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isGoodGhosting)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()

        const link = links.find(isGoodGhosting)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    let [id = ''] = props.url.match(/pools\/([\w ]+)/) ?? []
    if (id) {
        id = id.replace('pools/', '')
    }
    usePluginWrapper(true)

    return (
        <EthereumChainBoundary chainId={ChainId.Matic}>
            <PreviewCard id={id} />
        </EthereumChainBoundary>
    )
}

export default sns
