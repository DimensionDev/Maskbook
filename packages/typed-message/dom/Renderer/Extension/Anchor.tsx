import { memo, useContext } from 'react'
import type { TypedMessageAnchor } from '../../../base'
import { withMetadata } from '../MetadataRender'
import { LinkDefault, MessageRenderUIComponentsContext } from '../utils/ComponentsContext'

export const TypedMessageAnchorRenderer = memo(function TypedMessageAnchorRenderer(props: TypedMessageAnchor) {
    const { content, href, category } = props
    const { Link = LinkDefault! } = useContext(MessageRenderUIComponentsContext)
    return withMetadata(
        props,
        <Link category={category} href={href}>
            {content}
        </Link>,
    )
})
