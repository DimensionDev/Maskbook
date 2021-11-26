import config from '../common/config'
import { Typography } from '@mui/material'

interface NFTItemProps {
    previewUrl?: string | null
    detailUrl?: string | null
    isShowingDetails?: boolean
}

const NFTItem = ({ previewUrl, detailUrl, isShowingDetails }: NFTItemProps) => {
    const containerClasses = `${classes.nftItem} ${!isShowingDetails ? 'object-cover' : 'object-contain'}`
    const fixSchemas = (url: string) => {
        if (url.startsWith('ipfs://')) {
            return url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/')
        }
        return url
    }

    previewUrl = fixSchemas(previewUrl || '')
    detailUrl = fixSchemas(detailUrl || '')

    const imageUrl = isShowingDetails
        ? detailUrl || previewUrl || config.undefinedImageAlt
        : previewUrl || detailUrl || config.undefinedImageAlt
    type contentTypes = 'html' | 'model' | 'video' | 'image'
    const getContentType = (url: string): contentTypes => {
        // Should better use Content-Type to detect, but don't know how to do that
        // todo: use Content-Type to detect type
        if (/(embed|farmhero\.io|0xAdventures\.com|crudefingers\.com|artblocks\.io)|\.(html?)$/.test(url)) {
            return 'html'
        }
        if (/\.(glb|gltf)$/.test(url)) {
            return 'model'
        }
        if (/\.(mp4|mov|webm|mp3)$/.test(url)) {
            return 'video'
        }
        return 'image' // default
    }

    return (
        <div className="flex flex-shrink-0 w-full aspect-w-1 aspect-h-1">
            {getContentType(imageUrl) === 'html' && <iframe className={containerClasses} src={detailUrl} />}
            {getContentType(imageUrl) === 'model' && (
                <div className="flex justify-center items-center">
                    <Typography variant="subtitle2" color="textPrimary">
                        Click to View
                    </Typography>
                </div>
            )}
            {getContentType(imageUrl) === 'video' && (
                <div className="flex justify-center items-center">
                    <Typography variant="subtitle2" color="textPrimary">
                        Click to View
                    </Typography>
                </div>
            )}
            {getContentType(imageUrl) === 'image' && (
                <img className={containerClasses} src={imageUrl} alt="NFT Image" />
            )}
        </div>
    )
}

const classes = {
    nftItem: 'bg-item-bg filter rounded w-full h-full',
}

export default NFTItem
