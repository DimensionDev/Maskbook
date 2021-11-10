import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared'
import { SnackbarContent } from '@mui/material'
import { base } from '../base'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { escapeRegExp } from 'lodash-es'
import { BASE_URL, VALID_CHAINS_ID } from '../constants'
import { MarketView } from './MarketView'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { ChainId } from '@masknet/web3-shared-evm'

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
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const links = useMemo(() => parseURL(text.val || ''), [text.val])
        const market = getMarketFromLinks(links)
        if (!text.ok) return null
        if (!market?.slug) return null
        return <Renderer link={market.link} slug={market.slug} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks())
        const market = getMarketFromLinks(links)
        if (!market?.slug) return null
        return <Renderer link={market.link} slug={market.slug} />
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ link: string; slug: string }>) {
    return (
        <MaskPluginWrapper pluginName="RealityCards">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary
                    chainId={ChainId.Matic}
                    isValidChainId={(chainId) => VALID_CHAINS_ID.includes(chainId)}>
                    <MarketView slug={props.slug} link={props.link} />
                </EthereumChainBoundary>
            </Suspense>
        </MaskPluginWrapper>
    )
}
