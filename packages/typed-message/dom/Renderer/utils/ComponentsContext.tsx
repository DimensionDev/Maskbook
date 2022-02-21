import { createContext } from 'react'
import type { MetadataRenderProps } from '../MetadataRender'

/** @internal */
export const TextDefault: MessageRenderUIComponentsContext['Text'] = (props) => <span>{props.children}</span>
/** @internal */
export const LinkDefault: MessageRenderUIComponentsContext['Link'] = (props) => (
    <a href={props.href} target="_blank" rel="noopener noreferrer">
        {props.children}
    </a>
)
/** @internal */
export const ImageDefault: MessageRenderUIComponentsContext['Image'] = (props) =>
    props.width === 0 ? null : <img src={props.src} width={props.width} height={props.height} />

/** @internal */
export const MetadataDefault = () => null

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
