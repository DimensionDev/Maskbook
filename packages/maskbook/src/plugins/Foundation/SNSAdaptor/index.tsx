import { base } from '../base'
import { uniq } from 'lodash-es'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { checkUrl, getRelevantUrl } from '../utils'
import { getTypedMessageContent } from '../../../protocols/typed-message'
import { ChainId } from '@masknet/web3-shared'
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
        const link = uniq(
            usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks()),
        ).find(checkUrl)
        const chainId = link?.includes('gorli') ? ChainId.Gorli : ChainId.Mainnet
        return link && chainId ? renderPostInspector({ link, chainId }) : null
    },
    DecryptedInspector: function Component(props) {
        const link = getRelevantUrl(getTypedMessageContent(props.message))
        const chainId = link?.includes('gorli') ? ChainId.Gorli : ChainId.Mainnet
        return link && chainId ? renderPostInspector({ link, chainId }) : null
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
