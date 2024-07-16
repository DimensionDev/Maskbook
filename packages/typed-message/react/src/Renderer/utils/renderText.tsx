import { memo, Fragment, createElement, useContext } from 'react'
import { RenderFragmentsContext, type RenderFragmentsContextType, DefaultRenderFragments } from './RenderFragments.js'
import type { TypedMessageAnchor } from '@masknet/typed-message'
import { parseLink } from '@masknet/typed-message/internal'

/** @internal */
interface RenderTextProps {
    text: string
    style?: React.CSSProperties
}

/** @internal */
export const RenderTextFragment = memo(function RenderText(props: RenderTextProps) {
    const { Text = DefaultRenderFragments.Text } = useContext(RenderFragmentsContext)
    return createElement(Fragment, {}, ...parseText(props.text, props.style, Text))
})

/** @internal */
export const RenderLinkFragment = memo(function RenderLink(
    props: Pick<TypedMessageAnchor, 'category'> & RenderFragmentsContextType.LinkProps,
) {
    const { children, href, category, suggestedPostImage, style } = props
    const context = useContext(RenderFragmentsContext)
    const {
        Text = DefaultRenderFragments.Text,
        Link = DefaultRenderFragments.Link,
        AtLink = Text,
        CashLink = Text,
        HashLink = Text,
    } = context
    const sharedProps = { style, children, suggestedPostImage }

    if (category === 'cash') {
        if (/^\$\d+/.test(children)) return <Text {...sharedProps} />
        return <CashLink {...sharedProps} />
    }
    if (category === 'hash') return <HashLink {...sharedProps} />
    if (category === 'user') return <AtLink {...sharedProps} />
    return <Link {...sharedProps} href={href} />
})

function parseText(
    string: string,
    style: React.CSSProperties | undefined,
    Text: NonNullable<RenderFragmentsContextType['Text']>,
) {
    const links = parseLink(string).flatMap((frag, index) => {
        if (frag.type === 'text') {
            return sliceString(frag.content).map((text, i) =>
                text === '\n' ?
                    <br style={style} key={`${index} of ${i}`} />
                :   <Text children={text} style={style} key={`${index} of ${i}`} />,
            )
        }
        if (frag.category === 'normal' && !frag.content.match(/^https?:\/\//gi)) frag.content = 'http://' + frag.content
        return (
            <RenderLinkFragment
                key={string}
                style={style}
                category={frag.category}
                href={frag.content}
                children={frag.content}
                suggestedPostImage={undefined}
            />
        )
    })
    return links
}

function sliceString(x: string): string[] {
    const result: string[] = []

    let index = x.indexOf('\n')

    if (index === -1) return [x]
    let pos = 0
    while (index !== -1) {
        result.push(x.slice(pos, index), '\n')
        pos = index + 1
        index = x.indexOf('\n', pos)
    }
    result.push(x.slice(pos))
    return result.filter(Boolean)
}
