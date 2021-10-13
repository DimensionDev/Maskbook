import type { FC } from 'react'
import { Link, Box } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import type { NftContract, Metadata } from '../types'

const useStyles = makeStyles()({
    body: {
        display: 'flex',
        justifyContent: 'center',
    },
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        border: 'none',
        boxShadow:
            '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
    },
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

function FoudationImage(props: Props) {
    const { classes } = useStyles()
    const image = props.metadata.image.split('/')
    const src = `${props.nftContract.baseURI}${image.at(-2)}/${image.at(-1)}`
    return (
        <Box className={classes.body}>
            <Link href={src} target="_blank" rel="noopener noreferrer">
                <Asset src={src} alt={props.metadata.name} />
            </Link>
        </Box>
    )
}

export default FoudationImage
