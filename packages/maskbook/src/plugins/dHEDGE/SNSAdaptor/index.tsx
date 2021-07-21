import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared'
import { SnackbarContent } from '@material-ui/core'
import { base } from '../base'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { PoolView } from '../UI/PoolView'
import { InvestDialog } from '../UI/InvestDialog'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { ChainId, getDHedgeConstants } from '@masknet/web3-shared'
import { getEnumAsArray } from '@dimensiondev/kit'
import { escapeRegExp } from 'lodash-es'

function createLinkRegExp(chainId: ChainId, link: string) {
    const BASE_URL = getDHedgeConstants(chainId).BASE_URL ?? ''
    return new RegExp(`${escapeRegExp(BASE_URL)}/pool/(\\w+)`)
}

function getPoolFromLink(link: string) {
    return getEnumAsArray(ChainId)
        .map(({ value: chainId }) => {
            const [, address] = link.match(createLinkRegExp(chainId, link)) ?? []
            return {
                link,
                address,
                chainId,
            }
        })
        .find((x) => x.address && x.link && x.chainId)
}

function getPoolFromLinks(links: string[]) {
    return links.map(getPoolFromLink).find(Boolean)
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const links = useMemo(() => parseURL(text.val || ''), [text.val])
        const pool = getPoolFromLinks(links)
        if (!text.ok) return null
        if (!pool) return null
        return <Renderer chainId={pool.chainId} address={pool.address} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks())
        const pool = getPoolFromLinks(links)
        if (!pool) return null
        return <Renderer chainId={pool.chainId} address={pool.address} />
    },
    GlobalInjection: function Component() {
        return (
            <>
                <InvestDialog />
            </>
        )
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ chainId: ChainId; address: string }>) {
    return (
        <MaskbookPluginWrapper pluginName="dHEDGE">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary chainId={props.chainId}>
                    <PoolView address={props.address} />
                </EthereumChainBoundary>
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
