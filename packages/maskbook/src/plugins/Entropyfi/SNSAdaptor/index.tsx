import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared'
import { ChainId } from '@masknet/web3-shared'
import { SnackbarContent } from '@material-ui/core'
import { base } from '../base'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { DepositDialog } from '../UI/DepositDialog'
import { ENTROPYFI_URL_PATTERN } from '../constants'
import { EntropyfiView } from '../UI/EntropyfiView'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const isEntropyfiUrl = (url: string) => ENTROPYFI_URL_PATTERN.test(url)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props) {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isEntropyfiUrl)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isEntropyfiUrl)

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
        <MaskbookPluginWrapper pluginName="Entropyfi">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary
                    chainId={ChainId.Kovan}
                    isValidChainId={(chainId) => [ChainId.Kovan, ChainId.Mumbai].includes(chainId)}>
                    <EntropyfiView />
                </EthereumChainBoundary>
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
