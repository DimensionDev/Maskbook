import { CircularProgress } from '@mui/material'
import { useAsync } from 'react-use'

export interface ImageProps {
    url: string
    title?: string
    isFullRound: boolean
    size: number
}

export const ImageHolder = ({ url, title, isFullRound, size }: ImageProps) => {
    const roundedClass = isFullRound ? 'rounded-full' : 'rounded'
    const containerStyles = {
        width: `${size}px`,
        height: `${size}px`,
    }

    const { loading, value: image } = useAsync(async () => {
        if (!url) return
        const data = await globalThis.r2d2Fetch(url)
        return URL.createObjectURL(await data.blob())
    }, [url])

    return (
        <div className={`flex justify-around relative ${roundedClass}`} style={containerStyles}>
            {loading ? (
                <CircularProgress size="small" />
            ) : (
                <img className={`object-cover w-full h-full ${roundedClass}`} src={image} alt={title} />
            )}
        </div>
    )
}
