import { Suspense, useMemo } from 'react'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID, Plugin, useChainId } from '@masknet/plugin-infra'
import { SnackbarContent } from '@mui/material'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { extractTextFromTypedMessage, parseURL } from '@masknet/shared-base'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import { PreviewCard } from './PreviewCard'
import { base } from '../base'
import { PLUGIN_NAME, PLUGIN_META_KEY } from '../constants'
import { DonateDialog } from './DonateDialog'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const isGitcoin = (x: string): boolean => /^https:\/\/gitcoin.co\/grants\/\d+/.test(x)
const isGitCoinSupported = (chainId: ChainId) => [ChainId.Mainnet, ChainId.Matic].includes(chainId)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isGitcoin)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    CompositionDialogMetadataBadgeRender: new Map([[PLUGIN_META_KEY, () => PLUGIN_NAME]]),
    GlobalInjection() {
        return <DonateDialog />
    },
    PostInspector() {
        const links = usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks())

        const link = links.find(isGitcoin)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [id = ''] = props.url.match(/\d+/) ?? []
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return (
        <MaskPluginWrapper pluginName="Gitcoin">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary chainId={isGitCoinSupported(chainId) ? chainId : ChainId.Mainnet}>
                    <PreviewCard id={id} />
                </EthereumChainBoundary>
            </Suspense>
        </MaskPluginWrapper>
    )
}

export default sns
