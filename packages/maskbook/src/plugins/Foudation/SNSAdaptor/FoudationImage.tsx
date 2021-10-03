import type { FC } from 'react'
import { Link } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { sliceAddress } from '../utils'
import type { NftContract, Metadata } from '../types'

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

interface Props extends React.PropsWithChildren<{}> {
    nftContract: NftContract
    metadata: Metadata
}

interface AssetPlayerProps {
    src?: string
    alt: string
}

const AssetPlayer: FC<AssetPlayerProps> = ({ src, alt }) => {
    const { classes } = useStyles()
    const path = sliceAddress(src)
    if (!src && path.length > 0) {
        return null
    }
    const isVideo = src?.match(/\.(mp4|webm|mp3|wav|ogg)$/i)
    const is3D = src?.match(/\.(glb|gltf)$/i)
    if (isVideo) {
        return (
            <img
                className={classes.player}
                src={`https://assets.foundation.app/${path[0]}/${path[1]}/${path[2]}/nft.jpg`}
                alt={alt}
            />
        )
    }
    if (is3D) {
        return (
            <img
                className={classes.player}
                src={`https://f8n-production-3d-models.imgix.net/${path[0]}/${path[1]}/${path[2]}/nft.png?q=80`}
                alt={alt}
            />
        )
    }

    return <img className={classes.player} src={src} alt={alt} />
}

function FoudationImage(props: Props) {
    const { classes } = useStyles()
    const image = props.metadata.image.split('/')
    const src = `${props.nftContract.baseURI}${image.at(-2)}/${image.at(-1)}`
    return (
        <div className={classes.body}>
            {src.match(/\.(mp4|webm)$/i) ? (
                <Link href={src} target="_blank" rel="noopener noreferrer">
                    <AssetPlayer src={src} alt={props.metadata.name} />
                </Link>
            ) : (
                <AssetPlayer src={src} alt={props.metadata.name} />
            )}
        </div>
    )
}

export default FoudationImage
