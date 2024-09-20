import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { uniq } from 'lodash-es'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils.js'
import { base } from '../base.js'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { Collectible } from './Collectible.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/macro'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)
        return asset?.project_id ? <Renderer chainId={asset.chain_id} projectId={asset.project_id} /> : null
    },
    DecryptedInspector(props) {
        const collectibleUrl = getRelevantUrl(extractTextFromTypedMessage(props.message).unwrapOr(''))
        const asset = getAssetInfoFromURL(collectibleUrl)
        return asset ? <Renderer chainId={asset.chain_id} projectId={asset.project_id} /> : null
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 15,
            description: (
                <Trans>
                    Artblocks allow you to pick a style that you like, pay for the work, and a randomly generated
                    version of the content is created by an algorithm and sent to your Ethereum account.
                </Trans>
            ),
            name: <Trans>Artblocks</Trans>,
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

export default site
