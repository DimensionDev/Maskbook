import { memo, useContext, useEffect, useState } from 'react'
import type { TypedMessageImage } from '../../../base'
import { withMetadata } from '../MetadataRender'
import { MessageRenderUIComponentsContext, ImageDefault } from '../utils/ComponentsContext'

export const TypedMessageImageRenderer = memo(function TypedMessageImageRenderer(props: TypedMessageImage) {
    const { Image = ImageDefault! } = useContext(MessageRenderUIComponentsContext)
    const { image, width, height } = props
    const [blobSrc, setBlobSrc] = useState<string | null>(null)

    useEffect(() => {
        if (typeof image === 'string') return
        const src = URL.createObjectURL(image)
        setBlobSrc(src)
        return () => {
            setBlobSrc(null)
            URL.revokeObjectURL(src)
        }
    }, [image])

    const finalSrc = blobSrc || image
    if (typeof finalSrc !== 'string') return null

    return withMetadata(props, <Image src={finalSrc} width={width} height={height} />)
})
