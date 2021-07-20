import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared'
import { SnackbarContent } from '@material-ui/core'
import { base } from '../base'
import { useIsPoolUrl, usePoolUrlPattern } from '../hooks/useUrl'
import { useFetchPool } from '../hooks/usePool'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { PoolView } from '../UI/PoolView'
import { InvestDialog } from '../UI/InvestDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const isPoolUrl = useIsPoolUrl()
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isPoolUrl)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const isPoolUrl = useIsPoolUrl()
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isPoolUrl)

        if (!link) return null
        return <Renderer url={link} />
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

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const DHEDGE_POOL_PATTERN = usePoolUrlPattern()
    const address = props.url.match(DHEDGE_POOL_PATTERN) || []

    //#region check pool
    const { value: pool, error, loading, retry } = useFetchPool(address[1])
    if (!pool) return null
    //#endregion

    return (
        <MaskbookPluginWrapper pluginName="dHEDGE">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <PoolView pool={pool} loading={loading} error={error} retry={retry} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
