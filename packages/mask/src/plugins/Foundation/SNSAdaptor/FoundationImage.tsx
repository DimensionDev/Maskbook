import type { FC } from 'react'
import { Grid, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { NftContract, Metadata } from '../types'

const useStyles = makeStyles()((theme) => {
    return {
        body: {
            display: 'flex',
            borderRadius: theme.spacing(0.5),
        },
        image: {
            borderRadius: theme.spacing(1),
            maxWidth: '100%',
        },
    }
})

interface Props extends React.PropsWithChildren<{}> {
    nftContract: NftContract
    metadata: Metadata
}

interface AssetProps {
    src?: string
    alt: string
}

function sliceAddress(address: string | undefined) {
    if (address) {
        const pathSlit = address.split('/')
        const pathTwo = pathSlit[pathSlit.length - 2].slice(-4)
        return [pathTwo.slice(0, 2), pathTwo.slice(2), pathSlit[pathSlit.length - 2]]
    }
    return ['']
}

const Asset: FC<AssetProps> = ({ src, alt }) => {
    const { classes } = useStyles()
    const path = sliceAddress(src)
    if (!src && path.length > 0) {
        return null
    }
    const isVideo = src?.match(/\.(mp4|webm|mp3|wav|ogg)$/i)
    if (isVideo) {
        return (
            <img
                className={classes.image}
                src={`https://assets.foundation.app/${path[0]}/${path[1]}/${path[2]}/nft.jpg`}
                alt={alt}
            />
        )
    }
    const is3D = src?.match(/\.(glb|gltf)$/i)
    if (is3D) {
        return (
            <img
                className={classes.image}
                src={`https://f8n-production-3d-models.imgix.net/${path[0]}/${path[1]}/${path[2]}/nft.png?q=80`}
                alt={alt}
            />
        )
    }
    return <img className={classes.image} src={src} alt={alt} />
}

function FoundationImage(props: Props) {
    const { classes } = useStyles()
    const image = props.metadata.image.split('/')
    const src = `${props.nftContract.baseURI}${image.at(-2)}/${image.at(-1)}`
    return (
        <Grid container justifyContent="center">
            <Link href={src} target="_blank" rel="noopener noreferrer">
                <Asset src={src} alt={props.metadata.name} />
            </Link>
        </Grid>
    )
}

export default FoundationImage
