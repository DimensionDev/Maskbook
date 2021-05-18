import { makeStyles, Link } from '@material-ui/core'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'

const useStyles = makeStyles((theme) => {
    return {
        body: {
            display: 'flex',
            justifyContent: 'center',
        },
        img: {
            maxWidth: '100%',
            maxWeight: '100%',
        },
    }
})

export interface ArticleTabProps {}

export function ArticleTab(props: ArticleTabProps) {
    const classes = useStyles()
    const { asset } = CollectibleState.useContainer()

    if (!asset.value) return null
    return (
        <CollectibleTab>
            <div className={classes.body}>
                {asset.value.animation_url ? (
                    <Link href={asset.value.animation_url} target="_blank" rel="noopener noreferrer">
                        <img src={asset.value.image_url} className={classes.img} alt={asset.value.name ?? ''} />
                    </Link>
                ) : (
                    <img src={asset.value.image_url} className={classes.img} alt={asset.value.name ?? ''} />
                )}
            </div>
        </CollectibleTab>
    )
}
