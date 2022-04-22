import { memo } from 'react'
import type { TypedMessageAnchor } from '../../../base/index.js'
import { RenderLinkFragment } from '../utils/renderText.js'

export const TypedMessageAnchorRenderer = memo(function TypedMessageAnchorRenderer(props: TypedMessageAnchor) {
    return <RenderLinkFragment category={props.category} children={props.content} href={props.href} />
})
