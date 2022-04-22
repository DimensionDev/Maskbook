import { memo, useContext, useEffect, useState } from 'react'
import type { TypedMessageImage } from '../../../base/index.js'
import { useMetadataRender } from '../MetadataRender.js'
import { RenderFragmentsContext, DefaultRenderFragments } from '../utils/RenderFragments.js'

export const TypedMessageImageRenderer = memo(function TypedMessageImageRenderer(props: TypedMessageImage) {
    const { Image = DefaultRenderFragments.Image } = useContext(RenderFragmentsContext)
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
    const meta = useMetadataRender(props)
    if (typeof finalSrc !== 'string') return null

    return (
        <>
            <Image src={finalSrc} width={width} height={height} />
            {meta}
        </>
    )
})
