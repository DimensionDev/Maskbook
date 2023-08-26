import { memo } from 'react'
import { type TypedMessageText, unstable_STYLE_META } from '@masknet/typed-message'
import { RenderTextFragment } from '../utils/renderText.js'
import { useMetadataRender } from '../MetadataRender.js'

export const TypedMessageTextRender = memo(function TypedMessageTextRender(props: TypedMessageText) {
    const { content } = props
    return (
        <>
            <RenderTextFragment style={Object(props.meta?.get(unstable_STYLE_META))} text={content} />
            {useMetadataRender(props)}
        </>
    )
})
