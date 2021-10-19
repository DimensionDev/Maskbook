import { Suspense } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { SnackbarContent } from '@material-ui/core'
import { base } from '../base'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { MarketView } from '../UI/MarketView'
import { AUGUR_CHAIN_ID, BASE_URL, PLUGIN_NAME } from '../constants'
import { escapeRegExp } from 'lodash-es'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { BuyDialog } from './BuyDialog'
import { SellDialog } from './SellDialog'

function createMatchLink() {
    return new RegExp(`${escapeRegExp(BASE_URL.concat('/#!/market?id='))}([x0-9A-Fa-f]+)-([0-9]+)$`)
}

function getMarketFromLink(link: string) {
    const matchLink = createMatchLink()
    const [, address, id] = matchLink ? link.match(matchLink) ?? [] : []
    return {
        link,
        address,
        id,
    }
}

function getMarketFromLinks(links: string[]) {
    return links.map(getMarketFromLink).find(Boolean)
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const links = usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks())
        const market = getMarketFromLinks(links)
        if (!market?.address || !market.id) return null
        return <Renderer link={market.link} address={market.address} id={market.id} />
    },
    GlobalInjection: function Component() {
        return (
            <>
                <BuyDialog />
                <SellDialog />
            </>
        )
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ link: string; address: string; id: string }>) {
    return (
        <MaskbookPluginWrapper pluginName={PLUGIN_NAME}>
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary chainId={AUGUR_CHAIN_ID}>
                    <MarketView link={props.link} address={props.address} id={props.id} />
                </EthereumChainBoundary>
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
