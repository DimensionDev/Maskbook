import { useMemo } from 'react'
import { Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra'
import { base } from '../base'
import { escapeRegExp } from 'lodash-unified'
import { BASE_URL } from '../constants'
import { MarketView } from './MarketView'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { ChainId } from '@masknet/web3-shared-evm'
import { parseURL } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'

function createMatchLink() {
    return new RegExp(`https:\/\/${escapeRegExp(BASE_URL)}\/cards\/(.+)`)
}

function getMarketFromLink(link: string) {
    const matchLink = createMatchLink()
    const [, slug] = matchLink ? link.match(matchLink) ?? [] : []
    return {
        link,
        slug,
    }
}

function getMarketFromLinks(links: string[]) {
    return links.map(getMarketFromLink).find(({ slug }) => !!slug)
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const links = useMemo(() => {
            const text = extractTextFromTypedMessage(props.message)
            if (text.none) return []
            return parseURL(text?.val ?? '')
        }, [props.message])

        const market = getMarketFromLinks(links)
        usePluginWrapper(!!market?.slug)
        if (!market?.slug) return null
        return <Renderer link={market.link} slug={market.slug} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const market = getMarketFromLinks(links)
        usePluginWrapper(!!market?.slug)
        if (!market?.slug) return null
        return <Renderer link={market.link} slug={market.slug} />
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ link: string; slug: string }>) {
    return (
        <EthereumChainBoundary chainId={ChainId.Matic}>
            <MarketView slug={props.slug} link={props.link} />
        </EthereumChainBoundary>
    )
}
