import { Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'

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
    const { asset } = CollectibleState.useContainer()

    if (!asset.value) return null
    const resourceUrl = asset.value.shareUrl || asset.value.ossUrl
    return (
        <CollectibleTab>
            <div className={classes.body}>
                {asset.value.ossUrl.match(/\.(mp4|avi|webm)$/i) ? (
                    <Link href={asset.value.ossUrl} target="_blank" rel="noopener noreferrer">
                        <img className={classes.player} src={resourceUrl} alt={asset.value.title} />
                    </Link>
                ) : (
                    <img className={classes.player} src={resourceUrl} alt={asset.value.title} />
                )}
            </div>
        </CollectibleTab>
    )
}
