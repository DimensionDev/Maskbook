import { base } from '../base'
import { uniq } from 'lodash-unified'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { checkUrl, getAssetInfoFromURL } from '../utils'
import type { ChainId } from '@masknet/web3-shared-evm'

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
        <MaskPluginWrapper pluginName="Shoyu">
            <EthereumChainBoundary chainId={props.chainId}>
                <ShoyuCard link={props.link} chainId={props.chainId} />
            </EthereumChainBoundary>
        </MaskPluginWrapper>
    )
}
