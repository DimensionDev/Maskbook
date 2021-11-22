import type { FC } from 'react'
import { Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Video } from '../../../components/shared/Video'
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

interface AssetPlayerProps {
    src?: string
    alt: string
}

// opensea supports: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF.
const AssetPlayer: FC<AssetPlayerProps> = ({ src, alt }) => {
    const { classes } = useStyles()
    if (!src) {
        return null
    }
    const isVideo = src.match(/\.(mp4|webm)$/i)
    if (isVideo) {
        return <Video src={src} VideoProps={{ className: classes.player }} />
    } else {
        return <img className={classes.player} src={src} alt={alt} />
    }
}

export interface ArticleTabProps {}

export function ArticleTab(props: ArticleTabProps) {
    const { classes } = useStyles()
    const { asset } = CollectibleState.useContainer()

    if (!asset.value) return null
    const resourceUrl = asset.value.shareUrl || asset.value.ossUrl
    return (
        <CollectibleTab>
            <div className={classes.body}>
                {asset.value.ossUrl.match(/\.(mp4|webm)$/i) ? (
                    <Link href={asset.value.ossUrl} target="_blank" rel="noopener noreferrer">
                        <AssetPlayer src={resourceUrl} alt={asset.value.title} />
                    </Link>
                ) : (
                    <AssetPlayer src={resourceUrl} alt={asset.value.title} />
                )}
            </div>
        </CollectibleTab>
    )
}
