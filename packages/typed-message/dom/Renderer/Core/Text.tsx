import { memo } from 'react'
import type { MessageRenderProps } from '../Entry'
import type { TypedMessageText } from '../../../base'
import { RenderText } from '../utils/renderText'
import { withMetadata } from '../MetadataRender'

export const TypedMessageTextRenderer = memo(function TypedMessageTextRenderer(
    props: MessageRenderProps<TypedMessageText>,
) {
    const { content } = props.message
    return withMetadata(props, <RenderText text={content} />)
})
