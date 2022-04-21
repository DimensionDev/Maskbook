import { memo } from 'react'
import type { TypedMessageText } from '../../../base/index.js'
import { RenderTextFragment } from '../utils/renderText.js'
import { useMetadataRender } from '../MetadataRender.js'

export const TypedMessageTextRenderer = memo(function TypedMessageTextRenderer(props: TypedMessageText) {
    const { content } = props
    return (
        <>
            <RenderTextFragment text={content} />
            {useMetadataRender(props)}
        </>
    )
})
