import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared'
import { SnackbarContent } from '@material-ui/core'
import { base } from '../base'
import { useIsMarketUrl } from '../hooks/useUrl'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { MarketView } from '../UI/MarketView'
import { BASE_URL } from '../constants'
import { escapeRegExp } from 'lodash-es'

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
    DecryptedInspector: function Component(props) {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const links = useMemo(() => parseURL(text.val || ''), [text.val])
        const market = getMarketFromLinks(links)
        if (!text.ok) return null
        if (!market?.address || !market.id) return null
        return <Renderer link={market.link} address={market.address} id={market.id} />
    },
    PostInspector: function Component() {
        const isMarketUrl = useIsMarketUrl()
        const links = usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks())
        const market = getMarketFromLinks(links)
        if (!market?.address || !market.id) return null
        return <Renderer link={market.link} address={market.address} id={market.id} />
    },
    GlobalInjection: function Component() {
        return <></>
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ link: string; address: string; id: string }>) {
    return (
        <MaskbookPluginWrapper pluginName="Augur">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <MarketView link={props.link} address={props.address} id={props.id} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
