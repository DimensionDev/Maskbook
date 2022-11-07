import { memo } from 'react'
import type { TypedMessageText } from '@masknet/typed-message'
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
