import * as React from 'react'
import { Typography, Link } from '@material-ui/core'
import anchorme from 'anchorme'
import type {
    TypedMessage,
    TypedMessageText,
    TypedMessageImage,
    TypedMessageCompound,
    TypedMessageUnknown,
    TypedMessageSuspended,
} from '../../protocols/typed-message'
import { unreachable } from '../../utils/utils'
import { Image } from '../shared/Image'
import { useAsync } from 'react-use'

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
    TypedMessageRenderer?: React.ComponentType<TypedMessageRendererProps<TypedMessage>>
    TypedMessageTextRenderer?: React.ComponentType<TypedMessageRendererProps<TypedMessageText>>
    TypedMessageImageRenderer?: React.ComponentType<TypedMessageRendererProps<TypedMessageImage>>
    TypedMessageCompoundRenderer?: React.ComponentType<TypedMessageRendererProps<TypedMessageCompound>>
    TypedMessageSuspendedRenderer?: React.ComponentType<TypedMessageRendererProps<TypedMessageSuspended>>
    TypedMessageUnknownRenderer?: React.ComponentType<TypedMessageRendererProps<TypedMessageUnknown>>
}

export const DefaultTypedMessageRenderer = React.memo(function DefaultTypedMessageRenderer(
    props: TypedMessageRendererProps<TypedMessage>,
) {
    switch (props.message.type) {
        case 'compound': {
            const Compound = props.TypedMessageCompoundRenderer || DefaultTypedMessageCompoundRenderer
            return <Compound {...props} message={props.message} />
        }
        case 'text': {
            const Text = props.TypedMessageTextRenderer || DefaultTypedMessageTextRenderer
            return <Text {...props} message={props.message} />
        }
        case 'image': {
            const Image = props.TypedMessageImageRenderer || DefaultTypedMessageImageRenderer
            return <Image {...props} message={props.message} />
        }
        case 'unknown': {
            const Unknown = props.TypedMessageUnknownRenderer || DefaultTypedMessageUnknownRenderer
            return <Unknown {...props} message={props.message} />
        }
        case 'empty':
            return renderWithMetadata(props, <></>)
        case 'suspended':
            const Suspended = props.TypedMessageSuspendedRenderer || DefaultTypedMessageSuspendedRenderer
            return <Suspended {...props} message={props.message} />
        default:
            return unreachable(props.message)
    }
})

export const DefaultTypedMessageTextRenderer = React.memo(function DefaultTypedMessageTextRenderer(
    props: TypedMessageRendererProps<TypedMessageText>,
) {
    return renderWithMetadata(
        props,
        <Typography variant="body1" style={{ lineBreak: 'anywhere' }} data-testid="text_payload">
            <RenderText text={props.message.content}></RenderText>
        </Typography>,
    )
})

export const DefaultTypedMessageImageRenderer = React.memo(function DefaultTypedMessageImageRenderer(
    props: TypedMessageRendererProps<TypedMessageImage>,
) {
    const { image, width, height } = props.message
    return renderWithMetadata(
        props,
        <Typography variant="body1" style={{ lineBreak: 'anywhere' }} data-testid="text_payload">
            <Image src={image} width={width} height={height} />
        </Typography>,
    )
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
    const R = props.TypedMessageRenderer || DefaultTypedMessageRenderer
    return (
        <>
            {props.message.items.map((x, index) => (
                <R key={index} {...props} message={x} />
            ))}
        </>
    )
})

export const DefaultTypedMessageUnknownRenderer = React.memo(function DefaultTypedMessageUnknownRenderer(
    props: TypedMessageRendererProps<TypedMessageUnknown>,
) {
    return renderWithMetadata(props, <Typography>Unknown message</Typography>)
})

export const DefaultTypedMessageSuspendedRenderer = React.memo(function DefaultTypedMessageSuspendedRenderer(
    props: TypedMessageRendererProps<TypedMessageSuspended>,
) {
    const { promise } = props.message
    const { loading, error, value } = useAsync(() => promise, [promise])
    return renderWithMetadata(
        props,
        loading ? 'Loading...' : error ? 'Error' : <DefaultTypedMessageRenderer {...props} message={value!} />,
    )
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
