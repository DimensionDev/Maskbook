import { useMemo } from 'react'
import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { FurucomboView } from '../UI/FurucomboView'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const matchLink = /^https:\/\/furucombo.app\/invest\/(pool|farm)\/(137|1)\/(0x\w+)/
const isFurucomboLink = (link: string): boolean => matchLink.test(link)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isFurucomboLink)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails.mentionedLinks().find(isFurucomboLink)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [, category, chainId, address] = props.url.match(matchLink) ?? []
    usePluginWrapper(true)
    return (
        <EthereumChainBoundary chainId={Number.parseInt(chainId, 10)}>
            <FurucomboView category={category} address={address} />
        </EthereumChainBoundary>
    )
}

export default sns
