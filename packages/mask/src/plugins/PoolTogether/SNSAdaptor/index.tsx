import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage } from '@masknet/typed-message/base'
import { parseURL } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { SnackbarContent } from '@mui/material'
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
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isPoolTogetherUrl)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = links.find(isPoolTogetherUrl)

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
