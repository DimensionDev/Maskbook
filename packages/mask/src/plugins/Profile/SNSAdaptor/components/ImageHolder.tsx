import React from 'react'

interface ImageProps {
    imageUrl: string
    title?: string
    isFullRound: boolean
    size: number
}

const ImageHolder = ({ imageUrl, title, isFullRound, size }: ImageProps) => {
    const roundedStyleString = isFullRound ? 'rounded-full' : 'rounded'
    const containerStyles = {
        width: `${size}px`,
        height: `${size}px`,
    }

    return (
        <div className={`flex justify-around relative ${roundedStyleString}`} style={containerStyles}>
            <img className={`object-cover w-full h-full ${roundedStyleString}`} src={imageUrl} alt={title} />
        </div>
    )
}

export default ImageHolder
