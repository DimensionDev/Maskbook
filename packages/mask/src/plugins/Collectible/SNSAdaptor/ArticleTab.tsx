import { makeStyles } from '@masknet/theme'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { AssetPlayer } from '@masknet/shared'
import { useMemo } from 'react'

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
    errorPlaceholder: {
        padding: '82px 0',
    },
    loadingPlaceholder: {
        padding: '74px 0',
    },
})

export interface ArticleTabProps {}

export function ArticleTab(props: ArticleTabProps) {
    const { classes } = useStyles()
    const { asset } = CollectibleState.useContainer()

    return useMemo(() => {
        if (!asset.value) return null
        const resourceUrl = asset.value.animation_url || asset.value.image_url
        return (
            <CollectibleTab>
                <div className={classes.body}>
                    <AssetPlayer
                        url={resourceUrl}
                        options={{
                            playsInline: true,
                        }}
                        classes={{
                            errorPlaceholder: classes.errorPlaceholder,
                            loadingPlaceholder: classes.loadingPlaceholder,
                        }}
                    />
                </div>
            </CollectibleTab>
        )
    }, [asset.value?.animation_url, asset.value?.image_url, classes])
}
