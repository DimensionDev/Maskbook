import { memo, Fragment, createElement, useContext } from 'react'
import _anchorme from 'anchorme'
import { MessageRenderUIComponentsContext, LinkDefault, TextDefault } from './ComponentsContext'
// ESM/CJS compat
const anchorme = ((_anchorme as any).default || _anchorme) as typeof _anchorme

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
    const links = anchorme.list(string)
    let current = string
    const fontSize =
        allowTextEnlarge && Array.from(current).length < 45
            ? 1.5
            : allowTextEnlarge && Array.from(current).length < 85
            ? 1.2
            : 1

    const result = []
    while (current.length) {
        const search1 = current.indexOf('\n')
        const search2 = links[0] ? current.indexOf(links[0].string) : -1
        // ? if rest is normal
        if (search1 === -1 && search2 === -1) {
            result.push(<Text children={current} fontSize={fontSize} />)
            break
        }
        // ? if rest have \n but no links
        if ((search1 < search2 && search1 !== -1) || search2 === -1) {
            result.push(<Text children={current.substring(0, search1)} fontSize={fontSize} />, <br key={current} />)
            current = current.substring(search1 + 1)
        }
        // ? if rest have links but no \n
        if ((search2 < search1 && search2 !== -1) || search1 === -1) {
            let link = links[0].string
            if (!links[0].protocol) link = 'http://' + link
            result.push(
                <Text children={current.substring(0, search2)} fontSize={fontSize} />,
                <Link href={link} children={links[0].string} fontSize={fontSize} />,
            )
            current = current.substring(search2 + links[0].string.length)
            links.shift()
        }
    }
    return result
}
