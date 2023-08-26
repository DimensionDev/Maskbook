import { memo, useContext, useEffect, useState } from 'react'
import { unstable_STYLE_META, type TypedMessageImage } from '@masknet/typed-message'
import { useMetadataRender } from '../MetadataRender.js'
import { RenderFragmentsContext, DefaultRenderFragments } from '../utils/RenderFragments.js'

export const TypedMessageImageRender = memo(function TypedMessageImageRender(props: TypedMessageImage) {
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

    const meta = useMetadataRender(props)
    const finalSrc = blobSrc || image
    if (typeof finalSrc !== 'string') return null

    return (
        <>
            <Image style={Object(props.meta?.get(unstable_STYLE_META))} src={finalSrc} width={width} height={height} />
            {meta}
        </>
    )
})
