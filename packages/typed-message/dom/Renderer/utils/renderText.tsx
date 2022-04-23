import { memo, Fragment, createElement, useContext } from 'react'
import { RenderFragmentsContext, RenderFragmentsContextType, DefaultRenderFragments } from './RenderFragments.js'
import type { TypedMessageAnchor } from '../../../base/index.js'
import { parseLink } from '../../../base/utils/parseLink.js'

/** @internal */
export interface RenderTextProps {
    text: string
}

/** @internal */
export const RenderTextFragment = memo(function RenderText(props: RenderTextProps) {
    const { Text = DefaultRenderFragments.Text } = useContext(RenderFragmentsContext)
    return createElement(Fragment, {}, ...parseText(props.text, Text))
})

/** @internal */
export const RenderLinkFragment = memo(function RenderLink(
    props: Pick<TypedMessageAnchor, 'category'> & RenderFragmentsContextType.LinkProps,
) {
    const { children, href, category } = props
    const context = useContext(RenderFragmentsContext)
    const {
        Text = DefaultRenderFragments.Text,
        Link = DefaultRenderFragments.Link,
        AtLink = Text,
        CashLink = Text,
        HashLink = Text,
    } = context
    if (category === 'cash') return <CashLink children={children} />
    if (category === 'hash') return <HashLink children={children} />
    if (category === 'user') return <AtLink children={children} />
    return <Link children={children} href={href} />
})

function parseText(string: string, Text: NonNullable<RenderFragmentsContextType['Text']>) {
    const links = parseLink(string).flatMap((x) => {
        if (x.type === 'text') {
            return sliceString(x.content).map((x) => (x === '\n' ? <br /> : <Text children={x} />))
        }
        if (x.category === 'normal' && !x.content.match(/^https?:\/\//gi)) x.content = 'http://' + x.content
        return <RenderLinkFragment category={x.category} href={x.content} children={x.content} />
    })
    return links
}

function sliceString(x: string): string[] {
    const result: string[] = []

    let pos = 0
    let index = x.indexOf('\n')

    if (index === -1) return [x]
    while (index !== -1) {
        result.push(x.slice(pos, index), '\n')
        pos = index + 1
        index = x.indexOf('\n', pos)
    }
    result.push(x.slice(pos))
    return result.filter(Boolean)
}
