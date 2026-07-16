import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import type { RenderFragmentsContextType } from '@masknet/typed-message-react'
import { Link } from '@mui/material'
import { memo } from 'react'

/**
 * For images that are rendered at the end of the post (parsed by postImagesParser), hide it in the render fragment so it won't render twice.
 */
export const IMAGE_RENDER_IGNORE = 'IMAGE_RENDER_IGNORE'
export const TwitterRenderFragments: RenderFragmentsContextType = {
    AtLink: memo(function (props) {
        const target = '/' + props.children.slice(1)
        return (
            <Link href={target} fontSize="inherit">
                {props.children}
            </Link>
        )
    }),
    HashLink: memo(function (props) {
        const text = props.children.slice(1)
        const target = `/hashtag/${encodeURIComponent(text)}?src=hashtag_click`
        const link = (
            <Link href={target} fontSize="inherit">
                {props.children}
                {props.suggestedPostImage}
            </Link>
        )
        const TagModifier = useActivatedPluginsSiteAdaptor(false).find((x) => x.TagModifier)?.TagModifier
        if (!TagModifier) return link

        return <TagModifier {...props} href={target} fallback={link} />
    }),
    CashLink: memo(function (props) {
        const target = `/search?q=${encodeURIComponent(props.children)}&src=cashtag_click`
        const link = (
            <Link href={target} fontSize="inherit">
                {props.children}
            </Link>
        )
        const TagModifier = useActivatedPluginsSiteAdaptor(false).find((x) => x.TagModifier)?.TagModifier
        if (!TagModifier) return link
        return <TagModifier {...props} href={target} fallback={link} />
    }),
    Image: memo(function ImageFragment(props: RenderFragmentsContextType.ImageProps) {
        return props.width === 0 || props.meta?.get(IMAGE_RENDER_IGNORE) ?
                null
            :   <img src={props.src} width={props.width} height={props.height} style={props.style} />
    }),
    Text: memo(function TextFragment(props: RenderFragmentsContextType.TextProps) {
        const TextModifier = useActivatedPluginsSiteAdaptor(false).find((x) => x.TextModifier)?.TextModifier

        const text = props.style ? <span style={props.style}>{props.children}</span> : props.children
        if (!TextModifier) return text

        return <TextModifier {...props} fallback={text}></TextModifier>
    }),
    Link: memo(function LinkFragment(props: RenderFragmentsContextType.LinkProps) {
        const LinkModifier = useActivatedPluginsSiteAdaptor(false).find((x) => x.LinkModifier)?.LinkModifier
        const link = (
            <Link href={props.href} target="_blank" rel="noopener noreferrer" fontSize="inherit">
                {props.children}
                {props.suggestedPostImage}
            </Link>
        )
        if (!LinkModifier) return link
        return <LinkModifier {...props} fallback={link}></LinkModifier>
    }),
}
