import { memo, Fragment, createElement, useContext } from 'react'
import { MessageRenderUIComponentsContext, LinkDefault, TextDefault } from './ComponentsContext'
import { parseLink } from '../../../base/utils/parseLink'

/** @internal */
export interface RenderTextProps {
    text: string
    allowTextEnlarge: boolean
}

/** @internal */
export const RenderText = memo(function RenderText(props: RenderTextProps) {
    const { Link = LinkDefault!, Text = TextDefault! } = useContext(MessageRenderUIComponentsContext)
    return createElement(Fragment, {}, ...parseText(props.text, props.allowTextEnlarge, { Link, Text }))
})

function parseText(
    string: string,
    allowTextEnlarge: boolean,
    components: Required<Pick<MessageRenderUIComponentsContext, 'Link' | 'Text'>>,
) {
    const { Link, Text } = components
    const fontSize =
        allowTextEnlarge && Array.from(string).length < 45
            ? 1.5
            : allowTextEnlarge && Array.from(string).length < 85
            ? 1.2
            : 1
    const links = parseLink(string).flatMap((x) => {
        if (x.type === 'text') {
            return x.content
                .split(/(\n)/g)
                .map((x) => (x === '\n' ? <br /> : <Text children={x} fontSize={fontSize} />))
        }
        if (x.content.match(/^https?:\/\//gi)) x.content = 'http://' + x.content
        return <Link category={x.category} children={x.content} href={x.content} fontSize={fontSize} />
    })
    return links
}
