import { memo } from 'react'
import { Typography, Link, makeStyles } from '@material-ui/core'
import anchorme from 'anchorme'
import classNames from 'classnames'
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
import { deconstructPayload } from '../../utils/type-transform/Payload'
import { PayloadReplacer } from './PayloadReplacer'

interface MetadataRendererProps {
    metadata: TypedMessage['meta']
    message: TypedMessage
}
export interface TypedMessageRendererProps<T extends TypedMessage> {
    /**
     * The TypedMessage
     */
    message: T
    allowTextEnlarge?: boolean
    afterPreviousMetadata?: React.ReactNode
    beforeLatterMetadata?: React.ReactNode
    metadataRenderer?: {
        before?: React.ComponentType<MetadataRendererProps>
        after?: React.ComponentType<MetadataRendererProps>
    }
}

export const DefaultTypedMessageRenderer = memo(function DefaultTypedMessageRenderer(
    props: TypedMessageRendererProps<TypedMessage>,
) {
    const Renderer = getRendererOfTypedMessage(props.message)[0]?.component || DefaultTypedMessageUnknownRenderer
    return <Renderer {...props} message={props.message} />
})

export const DefaultTypedMessageTextRenderer = memo(function DefaultTypedMessageTextRenderer(
    props: TypedMessageRendererProps<TypedMessageText>,
) {
    const { content } = props.message
    const deconstructed = deconstructPayload(content, null)
    return renderWithMetadata(
        props,
        <Typography component="span" color="textPrimary" variant="body1" data-testid="text_payload">
            {deconstructed.ok ? (
                <PayloadReplacer payload={content} />
            ) : (
                <RenderText text={content} allowTextEnlarge={Boolean(props.allowTextEnlarge)} />
            )}
        </Typography>,
    )
})
registerTypedMessageRenderer('text', {
    component: DefaultTypedMessageTextRenderer,
    id: 'maskbook.text',
    priority: 0,
})

export const DefaultTypedMessageAnchorRenderer = memo(function DefaultTypedMessageAnchorRenderer(
    props: TypedMessageRendererProps<TypedMessageAnchor>,
) {
    const { content, href } = props.message
    const deconstructed = deconstructPayload(content, null)
    return renderWithMetadata(
        props,
        <Typography component="span" variant="body1" data-testid="anchor_payload">
            {deconstructed.ok ? (
                <PayloadReplacer payload={href} />
            ) : (
                // TODO: shrink link size
                <Link color="primary" target="_blank" rel="noopener noreferrer" href={href}>
                    {content}
                </Link>
            )}
        </Typography>,
    )
})
registerTypedMessageRenderer('anchor', {
    component: DefaultTypedMessageAnchorRenderer,
    id: 'maskbook.anchor',
    priority: 0,
})

export const DefaultTypedMessageImageRenderer = memo(function DefaultTypedMessageImageRenderer(
    props: TypedMessageRendererProps<TypedMessageImage>,
) {
    const { image, width, height } = props.message
    return renderWithMetadata(
        props,
        <Typography variant="body1" data-testid="image_payload">
            <Image src={image} width={width} height={height} />
        </Typography>,
    )
})
registerTypedMessageRenderer('image', {
    component: DefaultTypedMessageImageRenderer,
    id: 'maskbook.image',
    priority: 0,
})

export const DefaultTypedMessageCompoundRenderer = memo(function DefaultTypedMessageCompoundRenderer(
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

export const DefaultTypedMessageEmptyRenderer = memo(function DefaultTypedMessageEmptyRenderer(
    props: TypedMessageRendererProps<TypedMessageEmpty>,
) {
    return renderWithMetadata(props, null)
})
registerTypedMessageRenderer('empty', {
    component: DefaultTypedMessageEmptyRenderer,
    id: 'maskbook.empty',
    priority: 0,
})

export const DefaultTypedMessageUnknownRenderer = memo(function DefaultTypedMessageUnknownRenderer(
    props: TypedMessageRendererProps<TypedMessageUnknown>,
) {
    return renderWithMetadata(props, <Typography color="textPrimary">Unknown message</Typography>)
})
registerTypedMessageRenderer('unknown', {
    component: DefaultTypedMessageUnknownRenderer,
    id: 'maskbook.unknown',
    priority: 0,
})

export const DefaultTypedMessageSuspendedRenderer = memo(function DefaultTypedMessageSuspendedRenderer(
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

const RenderText = memo(function RenderText(props: { text: string; allowTextEnlarge: boolean }) {
    return <>{parseText(props.text, props.allowTextEnlarge)}</>
})

interface ParseTextProps {
    text: string
    fontSize: number
}

interface ParseTextLinkProps extends ParseTextProps {
    link: string
}

const useStyle = makeStyles((theme) => ({
    link: {
        color: theme.palette.primary.main,
    },
    text: {
        fontSize: (fontSize) => Number(fontSize) + 'rem',
    },
}))

const ParseTextLink = memo(function ParseTextLink({ link, text, fontSize }: ParseTextLinkProps) {
    const classes = useStyle(fontSize)
    return (
        <Link
            className={classNames(classes.text, classes.link)}
            target="_blank"
            rel="noopener noreferrer"
            href={link}
            key={link}>
            {text}
        </Link>
    )
})

const ParseText = memo(function ParseText({ text, fontSize }: ParseTextProps) {
    const classes = useStyle(fontSize)
    return <span className={classes.text}>{text}</span>
})

function parseText(string: string, allowTextEnlarge: boolean) {
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
        const search1 = current.search('\n')
        const search2 = links[0] ? current.search(links[0].string) : -1
        // ? if rest is normal
        if (search1 === -1 && search2 === -1) {
            result.push(<ParseText text={current} fontSize={fontSize} />)
            break
        }
        // ? if rest have \n but no links
        if ((search1 < search2 && search1 !== -1) || search2 === -1) {
            result.push(<ParseText text={current.substring(0, search1)} fontSize={fontSize} />, <br key={current} />)
            current = current.substring(search1 + 1)
        }
        // ? if rest have links but no \n
        if ((search2 < search1 && search2 !== -1) || search1 === -1) {
            let link = links[0].string
            if (!links[0].protocol) link = 'http://' + link
            result.push(
                <ParseText text={current.substring(0, search2)} fontSize={fontSize} />,
                <ParseTextLink link={link} text={links[0].string} fontSize={fontSize} />,
            )
            current = current.substring(search2 + links[0].string.length)
            links.shift()
        }
    }
    return result
}
