import { Suspense, useMemo } from 'react'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { SnackbarContent } from '@material-ui/core'
import { base } from '../base'
import { parseURL } from '../../../utils/utils'
import { extractTextFromTypedMessage } from '../../../protocols/typed-message'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { PreviewCard } from './components/PreviewCard'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { Context } from '../hooks/useContext'

const isMaskBox = (x: string) => x.startsWith('https://box-beta.mask.io') || x.startsWith('https://box.mask.io')

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const text = useMemo(() => extractTextFromTypedMessage(props.message), [props.message])
        const link = useMemo(() => parseURL(text.val || ''), [text.val]).find(isMaskBox)
        if (!text.ok) return null
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .find(isMaskBox)
        if (!link) return null
        return <Renderer url={link} />
    },
}

export default sns

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [, chainId] = props.url.match(/chain=(\d+)/i) ?? []
    const [, boxId] = props.url.match(/box=(\d+)/i) ?? []

    if (!chainId || !boxId) return null

    return (
        <MaskPluginWrapper pluginName="MaskBox">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <EthereumChainBoundary chainId={Number.parseInt(chainId, 10)}>
                    <Context.Provider initialState={{ boxId }}>
                        <PreviewCard />
                    </Context.Provider>
                </EthereumChainBoundary>
            </Suspense>
        </MaskPluginWrapper>
    )
}
