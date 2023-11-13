import { memo } from 'react'
import type { TypedMessageAnchor } from '@masknet/typed-message'
import { RenderLinkFragment } from '../utils/renderText.js'

export const TypedMessageAnchorRender = memo(function TypedMessageAnchorRender(props: TypedMessageAnchor) {
    return (
        <RenderLinkFragment
            category={props.category}
            children={props.content}
            href={props.href}
            suggestedPostImage={
                typeof props.postImage?.image === 'string' ?
                    // TODO: support Blob image
                    // Note: no need to add alt here because itself is a decorate image.
                    <img
                        src={props.postImage.image}
                        // we use relative sizing here. ignore the original size
                        style={{ height: '1.25em', marginLeft: '0.25em' }}
                        alt=""
                    />
                :   null
            }
        />
    )
})
