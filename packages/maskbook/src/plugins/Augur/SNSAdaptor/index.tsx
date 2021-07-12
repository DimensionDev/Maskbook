import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared'
import { SnackbarContent } from '@material-ui/core'
import { base } from '../base'
import { useIsMarketUrl, useMarketUrlPattern } from '../hooks/useUrl'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { MarketView } from '../UI/MarketView'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const isMarketUrl = useIsMarketUrl()
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isMarketUrl)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const isMarketUrl = useIsMarketUrl()
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isMarketUrl)

        if (!link) return null
        return <Renderer url={link} />
    },
    GlobalInjection: function Component() {
        return <></>
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const AUGUR_MARKET_PATTERN = useMarketUrlPattern()
    const address = props.url.match(AUGUR_MARKET_PATTERN) || []

    // //#region fetch market
    // const { value: pool, error, loading, retry } = useFetchPool(address[1])
    // if (!pool) return null
    // //#endregion

    return (
        <MaskbookPluginWrapper pluginName="Augur">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <MarketView market={undefined} loading={false} error={undefined} retry={() => {}} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
