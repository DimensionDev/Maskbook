import { memo, useContext } from 'react'
import type { MessageRenderProps } from '../Entry'
import type { TypedMessageText } from '../../../base'
import { RenderText } from '../utils/renderText'
import { __allowTextEnlargeContext } from '../utils/AllowTextEnlargeContext'
import { withMetadata } from '../MetadataRender'

export const TypedMessageTextRenderer = memo(function TypedMessageTextRenderer(
    props: MessageRenderProps<TypedMessageText>,
) {
    const { content } = props.message
    const allowTextEnlarge = useContext(__allowTextEnlargeContext)
    return withMetadata(props, <RenderText text={content} allowTextEnlarge={allowTextEnlarge} />)
})
