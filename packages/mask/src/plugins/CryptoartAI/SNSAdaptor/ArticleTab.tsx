import { makeStyles } from '@masknet/theme'
import { AssetPreviewer } from '@masknet/shared'
import { CollectibleTab } from './CollectibleTab.js'
import { CollectibleState } from '../hooks/useCollectibleState.js'
import { Video } from '../../../components/shared/Video.js'

const useStyles = makeStyles()({
    body: {
        display: 'flex',
        justifyContent: 'center',
        height: '300px',
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
                {asset.value.metadataContentType === 'video/mp4' ? (
                    <Video VideoProps={{ controls: true }} src={resourceUrl} />
                ) : (
                    <AssetPreviewer url={resourceUrl} />
                )}
            </div>
        </CollectibleTab>
    )
}
