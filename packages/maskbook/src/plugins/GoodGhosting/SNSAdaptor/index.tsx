import { Suspense, useMemo } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { SnackbarContent } from '@material-ui/core'
import { parseURL } from '../../../utils/utils'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../../protocols/typed-message'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import { PreviewCard } from '../UI/PreviewCard'
import { ChainId } from '@masknet/web3-shared'
import { base } from '../base'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const isGoodGhosting = (x: string): boolean => /^https:\/\/goodghosting.com/.test(x)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isGoodGhosting)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isGoodGhosting)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    return (
        <MaskbookPluginWrapper pluginName="GoodGhosting">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary chainId={ChainId.Matic}>
                    <PreviewCard />
                </EthereumChainBoundary>
            </Suspense>
        </MaskbookPluginWrapper>
    )
}

export default sns
