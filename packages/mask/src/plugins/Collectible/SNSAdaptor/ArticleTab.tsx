import { useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { hasNativeAPI } from '../../../../shared/native-rpc'

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
    imgWrapper: {
        maxWidth: 300,
    },
}))

export interface ArticleTabProps {}

export function ArticleTab(props: ArticleTabProps) {
    const { classes } = useStyles()
    const { asset } = CollectibleState.useContainer()

    return useMemo(() => {
        if (!asset.value) return null
        // TODO: Migrate `hasNativeAPI` to `@masknet/shared` to use it in <NFTCardStyledAssetPlayer /> directly.
        const resourceUrl = hasNativeAPI
            ? asset.value.metadata?.imageURL || asset.value.metadata?.mediaURL
            : asset.value.metadata?.mediaURL || asset.value.metadata?.imageURL
        return (
            <CollectibleTab>
                <div className={classes.body}>
                    <NFTCardStyledAssetPlayer url={resourceUrl} classes={classes} isNative={hasNativeAPI} />
                </div>
            </CollectibleTab>
        )
    }, [asset.value?.metadata?.mediaURL, asset.value?.metadata?.imageURL, classes])
}
