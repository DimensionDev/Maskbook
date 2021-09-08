import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared'
import { Suspense } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { URL_PATTERN } from '../constants'
import { base } from '../base'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { BarnBridgeTabContainerView } from '../UI/BarnBridgeTabContainerView'

const isBarnBridgeUrl = (url: string) => URL_PATTERN.test(url)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {
        console.debug('Example plugin has been loaded.')
        signal.addEventListener('abort', () => console.debug('Example plugin has been terminated'))
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isBarnBridgeUrl)

        if (!link) return null
        return <Renderer url={link} />
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    return (
        <MaskbookPluginWrapper pluginName="BarnBridge">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary
                    chainId={ChainId.Mainnet}
                    isValidChainId={(chainId) => [ChainId.Mainnet, ChainId.Matic].includes(chainId)}>
                    <BarnBridgeTabContainerView />
                </EthereumChainBoundary>
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
