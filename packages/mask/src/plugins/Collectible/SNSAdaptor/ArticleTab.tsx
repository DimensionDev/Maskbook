import { makeStyles } from '@masknet/theme'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { AssetPlayer } from '@masknet/shared'
import { useMemo } from 'react'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        justifyContent: 'center',
        minHeight: 300,
    },
    player: {
        maxWidth: '100%',
        maxHeight: '100%',
        border: 'none',
    },
    errorPlaceholder: {
        padding: '82px 0',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        width: '100%',
    },
    loadingPlaceholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '74px 0',
    },
    loadingIcon: {
        width: 36,
        height: 52,
    },
    errorIcon: {
        width: 36,
        height: 36,
    },
    iframe: {
        minWidth: 300,
        minHeight: 300,
    },
}))

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
                        classes={classes}
                        isFixedIframeSize={false}
                    />
                </div>
            </CollectibleTab>
        )
    }, [asset.value?.animation_url, asset.value?.image_url, classes])
}
