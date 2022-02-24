import { memo } from 'react'
import type { TypedMessageAnchor } from '../../../base'
import { RenderLinkFragment } from '../utils/renderText'

export const TypedMessageAnchorRenderer = memo(function TypedMessageAnchorRenderer(props: TypedMessageAnchor) {
    return <RenderLinkFragment category={props.category} children={props.content} href={props.href} />
})
