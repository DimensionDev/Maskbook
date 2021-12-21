import { makeStyles } from '@masknet/theme'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { AssetPlayer } from '@masknet/shared'

const useStyles = makeStyles()({
    body: {
        display: 'flex',
        justifyContent: 'center',
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
    const resourceUrl = asset.value.animation_url || asset.value.image_url
    return (
        <CollectibleTab>
            <div className={classes.body}>
                {resourceUrl ? (
                    <AssetPlayer
                        url={resourceUrl}
                        options={{
                            autoPlay: true,
                            loop: true,
                            playsInline: true,
                        }}
                    />
                ) : null}
            </div>
        </CollectibleTab>
    )
}
