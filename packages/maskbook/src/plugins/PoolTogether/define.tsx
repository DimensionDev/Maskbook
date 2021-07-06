import { PluginConfig, PluginStage, PluginScope } from '../types'
import React, { Suspense, useMemo } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { parseURL } from '../../utils/utils'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../protocols/typed-message'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { POOLTOGETHER_PLUGIN_ID, URL_PATTERN } from './constants'
import { PoolTogetherIcon } from '../../resources/PoolTogetherIcon'
import { PoolTogetherView } from './UI/PoolTogetherView'
import { DepositDialog } from './UI/DepositDialog'

const isPoolTogetherUrl = (url: string) => URL_PATTERN.test(url)

export const PoolTogetherPluginDefine: PluginConfig = {
    id: POOLTOGETHER_PLUGIN_ID,
    pluginIcon: <PoolTogetherIcon />,
    pluginName: 'PoolTogether',
    pluginDescription: 'PoolTogether is a protocol for no-loss prize games on the Ethereum blockchain',
    identifier: POOLTOGETHER_PLUGIN_ID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Component(props): JSX.Element | null {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isPoolTogetherUrl)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    postInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isPoolTogetherUrl)

        if (!link) return null
        return <Renderer url={link} />
    },
    PageComponent() {
        return <DepositDialog />
    },
    DashboardComponent() {
        return <DepositDialog />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    return (
        <MaskbookPluginWrapper pluginName="PoolTogether">
            <Suspense fallback={<SnackbarContent message="Mask is loading PoolTogether plugin..." />}>
                <PoolTogetherView />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
