export interface ImageProps {
    url: string
    title?: string
    isFullRound: boolean
    size: number
}

export const ImageHolder = ({ url, title, isFullRound, size }: ImageProps) => {
    const roundedStyleString = isFullRound ? 'rounded-full' : 'rounded'
    const containerStyles = {
        width: `${size}px`,
        height: `${size}px`,
    }

    return (
        <div className={`flex justify-around relative ${roundedStyleString}`} style={containerStyles}>
            <img className={`object-cover w-full h-full ${roundedStyleString}`} src={url} alt={title} />
        </div>
    )
}
