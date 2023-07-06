import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { uniq } from 'lodash-es'
import { Trans } from 'react-i18next'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils.js'
import { base } from '../base.js'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { Collectible } from './Collectible.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { ArtBlocksContainer } from '../hooks/context.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)
        return asset?.project_id ? (
            <ArtBlocksContainer.Provider>
                <Renderer chainId={asset.chain_id} projectId={asset.project_id} />
            </ArtBlocksContainer.Provider>
        ) : null
    },
    DecryptedInspector(props) {
        const collectibleUrl = getRelevantUrl(extractTextFromTypedMessage(props.message).unwrapOr(''))
        const url = new URL(collectibleUrl!)
        const postUrl = url.searchParams.get('postUrl') ?? ''
        const asset = getAssetInfoFromURL(collectibleUrl)
        return asset ? (
            <ArtBlocksContainer.Provider initialState={{ postUrl }}>
                <Renderer chainId={asset.chain_id} projectId={asset.project_id} />{' '}
            </ArtBlocksContainer.Provider>
        ) : null
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 15,
            description: <Trans i18nKey="plugin_artblocks_description" />,
            name: <Trans i18nKey="plugin_artblocks_name" />,
            icon: <Icons.ArtBlocks size={36} />,
        },
    ],
}

function Renderer(
    props: React.PropsWithChildren<{
        chainId: ChainId
        projectId: string
    }>,
) {
    usePluginWrapper(true)
    return <Collectible chainId={props.chainId} projectId={props.projectId} />
}

export default sns
