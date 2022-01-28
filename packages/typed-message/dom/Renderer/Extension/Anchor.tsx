import { memo, useContext } from 'react'
import type { TypedMessageAnchor } from '../../../base'
import { LinkDefault, MessageRenderUIComponentsContext } from '../utils/ComponentsContext'

export const TypedMessageAnchorRenderer = memo(function TypedMessageAnchorRenderer(props: TypedMessageAnchor) {
    const { content, href, category } = props
    const { Link = LinkDefault! } = useContext(MessageRenderUIComponentsContext)
    // Not render meta of inline component.
    return (
        <Link category={category} href={href}>
            {content}
        </Link>
    )
})
