import { memo } from 'react'
import { Link } from '@mui/material'
import type { RenderFragmentsContextType } from '@masknet/typed-message-react'
import { useTagEnhancer } from '../../../../shared-ui/TypedMessageRender/Components/Text.js'

/**
 * For images that are rendered at the end of the post (parsed by postImagesParser), hide it in the render fragment so it won't render twice.
 */
export const IMAGE_RENDER_IGNORE = 'IMAGE_RENDER_IGNORE'
export const TwitterRenderFragments: RenderFragmentsContextType = {
    AtLink: memo(function (props) {
        const target = '/' + props.children.slice(1)
        return <Link href={target} children={props.children} fontSize="inherit" />
    }),
    HashLink: memo(function (props) {
        const text = props.children.slice(1)
        const target = `/hashtag/${encodeURIComponent(text)}?src=hashtag_click`
        const { hasMatch, ...events } = useTagEnhancer('hash', text)
        return (
            <Link {...events} href={target} fontSize="inherit">
                {props.children}
                {props.suggestedPostImage}
            </Link>
        )
    }),
    CashLink: memo(function (props) {
        const target = `/search?q=${encodeURIComponent(props.children)}&src=cashtag_click`
        const { hasMatch, ...events } = useTagEnhancer('cash', props.children.slice(1))
        return <Link {...events} href={target} children={props.children} fontSize="inherit" />
    }),
    Image: memo(function ImageFragment(props: RenderFragmentsContextType.ImageProps) {
        return props.width === 0 || props.meta?.get(IMAGE_RENDER_IGNORE) ?
                null
            :   <img src={props.src} width={props.width} height={props.height} style={props.style} />
    }),
}
