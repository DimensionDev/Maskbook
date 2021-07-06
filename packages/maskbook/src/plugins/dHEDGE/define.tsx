import { PluginConfig, PluginStage, PluginScope } from '../types'
import React, { Suspense, useMemo } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { parseURL } from '../../utils/utils'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../protocols/typed-message'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { DHEDGE_PLUGIN_ID } from './constants'
import { usePoolUrlPattern, useIsPoolUrl } from './hooks/useUrl'
import { PoolView } from './UI/PoolView'
import { InvestDialog } from './UI/InvestDialog'
import { DHEDGEIcon } from '../../resources/DHEDGEIcon'
import { useFetchPool } from './hooks/usePool'

export const DHedgePluginDefine: PluginConfig = {
    id: DHEDGE_PLUGIN_ID,
    pluginIcon: <DHEDGEIcon />,
    pluginName: 'dHEDGE',
    pluginDescription: 'Decentralized hedge funds on Ethereum.',
    identifier: DHEDGE_PLUGIN_ID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Component(props): JSX.Element | null {
        const isPoolUrl = useIsPoolUrl()
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isPoolUrl)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    postInspector: function Component(): JSX.Element | null {
        const isPoolUrl = useIsPoolUrl()
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isPoolUrl)

        if (!link) return null
        return <Renderer url={link} />
    },
    PageComponent() {
        return (
            <>
                <InvestDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <InvestDialog />
            </>
        )
    },
}

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
