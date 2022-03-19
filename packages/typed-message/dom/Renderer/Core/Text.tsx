import { memo } from 'react'
import type { TypedMessageText } from '../../../base'
import { RenderTextFragment } from '../utils/renderText'
import { useMetadataRender } from '../MetadataRender'

export const TypedMessageTextRenderer = memo(function TypedMessageTextRenderer(props: TypedMessageText) {
    const { content } = props
    return (
        <>
            <RenderTextFragment text={content} />
            {useMetadataRender(props)}
        </>
    )
})
