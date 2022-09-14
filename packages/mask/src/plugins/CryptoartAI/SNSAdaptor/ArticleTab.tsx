import { makeStyles } from '@masknet/theme'
import { CollectibleTab } from './CollectibleTab.js'
import { CollectibleState } from '../hooks/useCollectibleState.js'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'

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
    iframe: {
        minWidth: 300,
        minHeight: 300,
        margin: 'auto',
    },
})

export interface ArticleTabProps {}

export function ArticleTab(props: ArticleTabProps) {
    const { classes } = useStyles()
    const { asset } = CollectibleState.useContainer()

    if (!asset.value) return null
    const resourceUrl = asset.value.ossUrl || asset.value.ossUrlCompress || asset.value.shareUrl
    return (
        <CollectibleTab>
            <div className={classes.body}>
                <NFTCardStyledAssetPlayer
                    url={resourceUrl}
                    classes={{
                        wrapper: classes.player,
                        iframe: classes.iframe,
                    }}
                />
            </div>
        </CollectibleTab>
    )
}
