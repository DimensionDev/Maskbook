import { memo } from 'react'
import type { TypedMessageText } from '@masknet/typed-message'
import { RenderTextFragment } from '../utils/renderText.js'
import { useMetadataRender } from '../MetadataRender.js'

export const TypedMessageTextRender = memo(function TypedMessageTextRender(props: TypedMessageText) {
    const { content } = props
    return (
        <>
            <RenderTextFragment text={content} />
            {useMetadataRender(props)}
        </>
    )
})
