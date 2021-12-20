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

    return (
        <div className={`flex justify-around relative ${roundedClass}`} style={containerStyles}>
            <img className={`object-cover w-full h-full ${roundedClass}`} src={url} alt={title} />
        </div>
    )
}
