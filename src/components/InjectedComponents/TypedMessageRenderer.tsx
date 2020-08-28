import * as React from 'react'
import { Typography, Link } from '@material-ui/core'
import anchorme from 'anchorme'
import {
    TypedMessage,
    TypedMessageText,
    TypedMessageAnchor,
    TypedMessageImage,
    TypedMessageCompound,
    TypedMessageUnknown,
    TypedMessageSuspended,
    registerTypedMessageRenderer,
    TypedMessageEmpty,
    makeTypedMessageText,
} from '../../protocols/typed-message'
import { Image } from '../shared/Image'
import { useAsync } from 'react-use'
import { getRendererOfTypedMessage } from '../../protocols/typed-message'

interface MetadataRendererProps {
    metadata: TypedMessage['meta']
    message: TypedMessage
}
export interface TypedMessageRendererProps<T extends TypedMessage> {
    /**
     * The TypedMessage
     */
    message: T
    afterPreviousMetadata?: React.ReactNode
    beforeLatterMetadata?: React.ReactNode
    metadataRenderer?: {
        before?: React.ComponentType<MetadataRendererProps>
        after?: React.ComponentType<MetadataRendererProps>
    }
}

export const DefaultTypedMessageRenderer = React.memo(function DefaultTypedMessageRenderer(
    props: TypedMessageRendererProps<TypedMessage>,
) {
    const Renderer = getRendererOfTypedMessage(props.message)[0]?.component || DefaultTypedMessageUnknownRenderer
    return <Renderer {...props} message={props.message} />
})

export const DefaultTypedMessageTextRenderer = React.memo(function DefaultTypedMessageTextRenderer(
    props: TypedMessageRendererProps<TypedMessageText>,
) {
    return renderWithMetadata(
        props,
        <Typography component="span" color="textPrimary" variant="body1" data-testid="text_payload">
            <RenderText text={props.message.content}></RenderText>
        </Typography>,
    )
})
registerTypedMessageRenderer('text', {
    component: DefaultTypedMessageTextRenderer,
    id: 'maskbook.text',
    priority: 0,
})

export const DefaultTypedMessageAnchorRenderer = React.memo(function DefaultTypedMessageAnchorRenderer(
    props: TypedMessageRendererProps<TypedMessageAnchor>,
) {
    const { content, href } = props.message
    return renderWithMetadata(
        props,
        <Typography component="span" variant="body1" data-testid="anchor_payload">
            <Link color="primary" target="_blank" rel="noopener noreferrer" href={href}>
                {content}
            </Link>
        </Typography>,
    )
})
registerTypedMessageRenderer('anchor', {
    component: DefaultTypedMessageAnchorRenderer,
    id: 'maskbook.anchor',
    priority: 0,
})

export const DefaultTypedMessageImageRenderer = React.memo(function DefaultTypedMessageImageRenderer(
    props: TypedMessageRendererProps<TypedMessageImage>,
) {
    const { image, width, height } = props.message
    return renderWithMetadata(
        props,
        <Typography variant="body1" style={{ lineBreak: 'anywhere' }} data-testid="image_payload">
            <Image src={image} width={width} height={height} />
        </Typography>,
    )
})
registerTypedMessageRenderer('image', {
    component: DefaultTypedMessageImageRenderer,
    id: 'maskbook.image',
    priority: 0,
})

export const DefaultTypedMessageCompoundRenderer = React.memo(function DefaultTypedMessageCompoundRenderer(
    props: TypedMessageRendererProps<TypedMessageCompound>,
) {
    try {
        JSON.stringify(props.message.items)
    } catch (e) {
        if ((e?.message as string).includes('circular structure')) {
            return (
                <Typography>
                    The TypedMessage has a circular structure so it can't be rendered on the screen.
                </Typography>
            )
        }
    }
    return (
        <>
            {props.message.items.map((x, index) => (
                <DefaultTypedMessageRenderer key={index} {...props} message={x} />
            ))}
        </>
    )
})
registerTypedMessageRenderer('compound', {
    component: DefaultTypedMessageCompoundRenderer,
    id: 'maskbook.compound',
    priority: 0,
})

export const DefaultTypedMessageEmptyRenderer = React.memo(function DefaultTypedMessageEmptyRenderer(
    props: TypedMessageRendererProps<TypedMessageEmpty>,
) {
    return renderWithMetadata(props, null)
})
registerTypedMessageRenderer('empty', {
    component: DefaultTypedMessageEmptyRenderer,
    id: 'maskbook.empty',
    priority: 0,
})

export const DefaultTypedMessageUnknownRenderer = React.memo(function DefaultTypedMessageUnknownRenderer(
    props: TypedMessageRendererProps<TypedMessageUnknown>,
) {
    return renderWithMetadata(props, <Typography color="textPrimary">Unknown message</Typography>)
})
registerTypedMessageRenderer('unknown', {
    component: DefaultTypedMessageUnknownRenderer,
    id: 'maskbook.unknown',
    priority: 0,
})

export const DefaultTypedMessageSuspendedRenderer = React.memo(function DefaultTypedMessageSuspendedRenderer(
    props: TypedMessageRendererProps<TypedMessageSuspended>,
) {
    const { promise } = props.message
    const { loading, error, value } = useAsync(() => promise, [promise])

    return renderWithMetadata(
        props,
        loading ? (
            <DefaultTypedMessageTextRenderer {...props} message={makeTypedMessageText('Loading...')} />
        ) : error ? (
            <DefaultTypedMessageTextRenderer {...props} message={makeTypedMessageText('Error!')} />
        ) : (
            <DefaultTypedMessageRenderer {...props} message={value!} />
        ),
    )
})
registerTypedMessageRenderer('suspended', {
    component: DefaultTypedMessageSuspendedRenderer,
    id: 'maskbook.suspended',
    priority: 0,
})

function DefaultMetadataRender() {
    return null
}

function renderWithMetadata(props: TypedMessageRendererProps<TypedMessage>, jsx: React.ReactNode) {
    const Before = props.metadataRenderer?.before || DefaultMetadataRender
    const After = props.metadataRenderer?.after || DefaultMetadataRender
    return (
        <>
            <Before metadata={props.message.meta} message={props.message} />
            {props.afterPreviousMetadata}
            {jsx}
            {props.beforeLatterMetadata}
            <After metadata={props.message.meta} message={props.message} />
        </>
    )
}

const RenderText = React.memo(function RenderText(props: { text: string }) {
    return <>{parseText(props.text)}</>
})

function parseText(string: string) {
    const links: { raw: string; protocol: string; encoded: string }[] = anchorme(string, { list: true })
    let current = string
    const result = []
    while (current.length) {
        const search1 = current.search('\n')
        const search2 = links[0] ? current.search(links[0].raw) : -1
        // ? if rest is normal
        if (search1 === -1 && search2 === -1) {
            result.push(current)
            break
        }
        // ? if rest have \n but no links
        if ((search1 < search2 && search1 !== -1) || search2 === -1) {
            result.push(current.substring(0, search1), <br key={current} />)
            current = current.substring(search1 + 1)
        }
        // ? if rest have links but no \n
        if ((search2 < search1 && search2 !== -1) || search1 === -1) {
            const link = links[0].protocol + links[0].encoded
            result.push(
                current.substring(0, search2),
                <Link color="textPrimary" target="_blank" rel="noopener noreferrer" href={link} key={link}>
                    {links[0].raw}
                </Link>,
            )
            current = current.substring(search2 + links[0].raw.length)
            links.shift()
        }
    }
    return result
}
