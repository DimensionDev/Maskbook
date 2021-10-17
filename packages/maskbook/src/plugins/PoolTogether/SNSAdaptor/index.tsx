import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared'
import { ChainId } from '@masknet/web3-shared-evm'
import { SnackbarContent } from '@material-ui/core'
import { base } from '../base'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { DepositDialog } from '../UI/DepositDialog'
import { URL_PATTERN } from '../constants'
import { PoolTogetherView } from '../UI/PoolTogetherView'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const isPoolTogetherUrl = (url: string) => URL_PATTERN.test(url)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isPoolTogetherUrl)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isPoolTogetherUrl)

        if (!link) return null
        return <Renderer url={link} />
    },
    GlobalInjection: function Component() {
        return <DepositDialog />
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    return (
        <MaskPluginWrapper pluginName="PoolTogether">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary
                    chainId={ChainId.Mainnet}
                    isValidChainId={(chainId) => [ChainId.Mainnet, ChainId.Matic].includes(chainId)}>
                    <PoolTogetherView />
                </EthereumChainBoundary>
            </Suspense>
        </MaskPluginWrapper>
    )
}
