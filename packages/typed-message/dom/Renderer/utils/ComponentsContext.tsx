import { createContext, memo } from 'react'
import type { MetadataRenderProps } from '../Entry'

/** @internal */
export const TextDefault: MessageRenderUIComponentsContext['Text'] = memo((props) => <span>{props.children}</span>)
/** @internal */
export const LinkDefault: MessageRenderUIComponentsContext['Link'] = memo((props) => (
    <a href={props.href} target="_blank" rel="noopener noreferrer">
        {props.children}
    </a>
))
/** @internal */
export const ImageDefault: MessageRenderUIComponentsContext['Image'] = memo((props) =>
    props.width === 0 ? null : <img src={props.src} width={props.width} height={props.height} />,
)

/** @internal */
export const MetadataDefault = memo(() => null)

export interface MessageRenderUIComponentsContext {
    Text?: React.ComponentType<{ children: string; fontSize?: number }>
    Link?: React.ComponentType<{
        href?: string
        category: 'normal' | 'hash' | 'cash' | 'user'
        children: string
        fontSize?: number
    }>
    Image?: React.ComponentType<{
        src: string
        width?: number
        height?: number
        aspectRatio?: number
    }>
    Metadata?: React.ComponentType<MetadataRenderProps>
}
export const MessageRenderUIComponentsContext = createContext<MessageRenderUIComponentsContext>({
    Text: TextDefault,
    Link: LinkDefault,
    Image: ImageDefault,
    Metadata: MetadataDefault,
})
