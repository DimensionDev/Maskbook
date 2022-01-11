import { base } from '../base'
import { uniq } from 'lodash-unified'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { checkUrl, getAssetInfoFromURL } from '../utils'
import type { ChainId } from '@masknet/web3-shared-evm'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import FoundationCard from './FoundationCard'

interface Props extends React.PropsWithChildren<{}> {
    link: string
    chainId: ChainId
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)
        return asset ? renderPostInspector(asset) : null
    },
}

export default sns
function renderPostInspector(props: Props) {
    return (
        <MaskPluginWrapper pluginName="Foundation">
            <EthereumChainBoundary chainId={props.chainId}>
                <FoundationCard link={props.link} chainId={props.chainId} />
            </EthereumChainBoundary>
        </MaskPluginWrapper>
    )
}
