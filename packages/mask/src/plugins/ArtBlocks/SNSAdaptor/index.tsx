import { Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra'
import { uniq } from 'lodash-unified'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'

import { base } from '../base'
import { getTypedMessageContent } from '../../../protocols/typed-message'
import { Collectible } from './Collectible'
import type { ChainId } from '@masknet/web3-shared-evm'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)

        return asset ? <Renderer chainId={asset?.chain_id} projectId={asset.project_id} /> : null
    },
    DecryptedInspector: function Component(props) {
        const collectibleUrl = getRelevantUrl(getTypedMessageContent(props.message))
        const asset = getAssetInfoFromURL(collectibleUrl)
        return asset ? <Renderer chainId={asset.chain_id} projectId={asset.project_id} /> : null
    },
}

function Renderer(props: React.PropsWithChildren<{ chainId: ChainId; projectId: string }>) {
    usePluginWrapper(true)
    return <Collectible projectId={props.projectId} />
}

export default sns
