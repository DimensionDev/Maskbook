import { memo, Fragment, createElement, useContext } from 'react'
import { RenderFragmentsContext, RenderFragmentsContextType, DefaultRenderFragments } from './RenderFragments'
import type { TypedMessageAnchor } from '../../../base'
import { parseLink } from '../../../base/utils/parseLink'
import { TextEnlargeContext } from './TextEnlargeContext'

/** @internal */
export interface RenderTextProps {
    text: string
}

/** @internal */
export const RenderTextFragment = memo(function RenderText(props: RenderTextProps) {
    const { Text = DefaultRenderFragments.Text } = useContext(RenderFragmentsContext)
    const allowTextEnlarge = useContext(TextEnlargeContext)
    return createElement(Fragment, {}, ...parseText(props.text, allowTextEnlarge, Text))
})

/** @internal */
export const RenderLinkFragment = memo(function RenderLink(
    props: Pick<TypedMessageAnchor, 'category'> & RenderFragmentsContextType.LinkProps,
) {
    const { children, href, category, fontSize } = props
    const context = useContext(RenderFragmentsContext)
    const {
        Text = DefaultRenderFragments.Text,
        Link = DefaultRenderFragments.Link,
        AtLink = Text,
        CashLink = Text,
        HashLink = Text,
    } = context
    if (category === 'cash') return <CashLink children={children} fontSize={fontSize} />
    if (category === 'hash') return <HashLink children={children} fontSize={fontSize} />
    if (category === 'user') return <AtLink children={children} fontSize={fontSize} />
    return <Link children={children} href={href} fontSize={fontSize} />
})

function parseText(string: string, allowTextEnlarge: boolean, Text: NonNullable<RenderFragmentsContextType['Text']>) {
    const fontSize =
        14 *
        (allowTextEnlarge && Array.from(string).length < 45
            ? 1.5
            : allowTextEnlarge && Array.from(string).length < 85
            ? 1.2
            : 1)
    const links = parseLink(string).flatMap((x) => {
        if (x.type === 'text') {
            return x.content
                .split(/(\n)/g)
                .map((x) => (x === '\n' ? <br /> : <Text children={x} fontSize={fontSize} />))
        }
        if (x.category === 'normal' && !x.content.match(/^https?:\/\//gi)) x.content = 'http://' + x.content
        return <RenderLinkFragment category={x.category} href={x.content} children={x.content} fontSize={fontSize} />
    })
    return links
}
