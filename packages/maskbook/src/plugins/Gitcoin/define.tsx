import { PluginConfig, PluginStage, PluginScope } from '../types'
import { Suspense, useMemo } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { parseURL } from '../../utils/utils'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../protocols/typed-message'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { GITCOIN_PLUGIN_ID } from './constants'
import { DonateDialog } from './UI/DonateDialog'
import { PreviewCard } from './UI/PreviewCard'

const isGitcoin = (x: string): boolean => /^https:\/\/gitcoin.co\/grants\/\d+/.test(x)

export const GitcoinPluginDefine: PluginConfig = {
    pluginName: 'Gitcoin',
    identifier: GITCOIN_PLUGIN_ID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Component(props): JSX.Element | null {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isGitcoin)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    postInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails('postMetadataMentionedLinks')
            .concat(usePostInfoDetails('postMentionedLinks'))
            .find(isGitcoin)
        if (!link) return null
        return <Renderer url={link} />
    },
    PageComponent() {
        return (
            <>
                <DonateDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <DonateDialog />
            </>
        )
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [id = ''] = props.url.match(/\d+/) ?? []
    return (
        <MaskbookPluginWrapper pluginName="Gitcoin">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <PreviewCard id={id} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
