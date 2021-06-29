import { PluginConfig, PluginStage, PluginScope } from '../types'
import { Suspense, useMemo } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { parseURL } from '../../utils/utils'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../protocols/typed-message'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { GOOD_GHOSTING_PLUGIN_ID } from './constants'
import { PreviewCard } from './UI/PreviewCard'

const isGoodGhosting = (x: string): boolean => /^https:\/\/goodghosting.com\/#\/beta/.test(x)

export const GoodGhostingPluginDefine: PluginConfig = {
    id: GOOD_GHOSTING_PLUGIN_ID,
    pluginIcon: '🔗',
    pluginName: 'GoodGhosting',
    pluginDescription: 'DeFi savings dApp on Polygon.',
    identifier: GOOD_GHOSTING_PLUGIN_ID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Component(props): JSX.Element | null {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isGoodGhosting)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    postInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isGoodGhosting)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [id = ''] = props.url.match(/\d+/) ?? []

    return (
        <MaskbookPluginWrapper pluginName="GoodGhosting">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <PreviewCard id={id} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
