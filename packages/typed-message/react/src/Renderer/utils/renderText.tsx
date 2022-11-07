import { memo, Fragment, createElement, useContext } from 'react'
import { RenderFragmentsContext, RenderFragmentsContextType, DefaultRenderFragments } from './RenderFragments.js'
import type { TypedMessageAnchor } from '@masknet/typed-message'
import { parseLink } from '@masknet/typed-message/internal'

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
    const { children, href, category, suggestedPostImage } = props
    const context = useContext(RenderFragmentsContext)
    const {
        Text = DefaultRenderFragments.Text,
        Link = DefaultRenderFragments.Link,
        AtLink = Text,
        CashLink = Text,
        HashLink = Text,
    } = context
    if (category === 'cash') return <CashLink children={children} suggestedPostImage={suggestedPostImage} />
    if (category === 'hash') return <HashLink children={children} suggestedPostImage={suggestedPostImage} />
    if (category === 'user') return <AtLink children={children} suggestedPostImage={suggestedPostImage} />
    return <Link children={children} href={href} suggestedPostImage={suggestedPostImage} />
})

function parseText(string: string, Text: NonNullable<RenderFragmentsContextType['Text']>) {
    const links = parseLink(string).flatMap((x) => {
        if (x.type === 'text') {
            return sliceString(x.content).map((x) => (x === '\n' ? <br /> : <Text children={x} />))
        }
        if (x.category === 'normal' && !x.content.match(/^https?:\/\//gi)) x.content = 'http://' + x.content
        return (
            <RenderLinkFragment
                category={x.category}
                href={x.content}
                children={x.content}
                suggestedPostImage={undefined}
            />
        )
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
