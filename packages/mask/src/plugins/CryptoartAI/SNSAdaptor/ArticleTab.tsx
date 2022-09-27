import { makeStyles } from '@masknet/theme'
import { AssetPreviewer } from '@masknet/shared'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { CollectibleTab } from './CollectibleTab.js'
import { CollectibleState } from '../hooks/useCollectibleState.js'

const useStyles = makeStyles()({
    body: {
        display: 'flex',
        justifyContent: 'center',
        height: '300px',
    },
    player: {
        maxWidth: '100%',
        maxHeight: '100%',
        border: 'none',
    },
})

export interface ArticleTabProps {}

export function ArticleTab(props: ArticleTabProps) {
    const { classes } = useStyles()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { asset } = CollectibleState.useContainer()

    if (!asset.value) return null
    const resourceUrl = asset.value.ossUrl || asset.value.ossUrlCompress || asset.value.shareUrl
    return (
        <CollectibleTab>
            <div className={classes.body}>
                <AssetPreviewer pluginID={NetworkPluginID.PLUGIN_EVM} chainId={chainId} url={resourceUrl} />
            </div>
        </CollectibleTab>
    )
}
