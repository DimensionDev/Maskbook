import { makeStyles, createStyles, Link } from '@material-ui/core'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'

const useStyles = makeStyles((theme) => {
    return createStyles({
        img: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        },
    })
})

export interface ArticleTabProps {}

export function ArticleTab(props: ArticleTabProps) {
    const classes = useStyles()

    const { asset } = CollectibleState.useContainer()

    return (
        <CollectibleTab>
            {asset.value?.animation_url ? (
                <Link href={asset.value?.animation_url} target="_blank" rel="noopener noreferrer">
                    <img src={asset.value?.imageUrl} className={classes.img} alt={asset.value?.name ?? ''} />
                </Link>
            ) : (
                <img src={asset.value?.imageUrl} className={classes.img} alt={asset.value?.name ?? ''} />
            )}
        </CollectibleTab>
    )
}
