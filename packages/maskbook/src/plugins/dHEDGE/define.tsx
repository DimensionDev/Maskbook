import { PluginConfig, PluginStage, PluginScope } from '../types'
import { Suspense, useMemo } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { parseURL } from '../../utils/utils'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../protocols/typed-message'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { DHEDGE_PLUGIN_ID } from './constants'
import { InvestDialog } from './UI/InvestDialog'
import { PreviewCard } from './UI/PreviewCard'

// const DHEDGE_POOL_PATTERN = /^https:\/\/app.dhedge.org\/pool\/(\w+)/
const DHEDGE_POOL_PATTERN = /^https:\/\/dh-1111.web.app\/pool\/(\w+)/

const isDHEDGE = (x: string): boolean => DHEDGE_POOL_PATTERN.test(x)

export const DHedgePluginDefine: PluginConfig = {
    id: DHEDGE_PLUGIN_ID,
    pluginIcon: '🔗',
    pluginName: 'dHEDGE',
    pluginDescription: 'Decentralized hedge funds on Ethereum.',
    identifier: DHEDGE_PLUGIN_ID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Component(props): JSX.Element | null {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isDHEDGE)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    postInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails('postMetadataMentionedLinks')
            .concat(usePostInfoDetails('postMentionedLinks'))
            .find(isDHEDGE)
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
    let address = ''
    const matches = props.url.match(DHEDGE_POOL_PATTERN)
    if (matches != null) address = matches[1]

    return (
        <MaskbookPluginWrapper pluginName="dHEDGE">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <PreviewCard address={address} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
