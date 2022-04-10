import { createContext, memo } from 'react'
import type { MetadataRenderProps } from '../MetadataRender.js'

export const DefaultRenderFragments = {
    Text: memo((props: RenderFragmentsContextType.TextProps) => <>{props.children}</>),
    Link: memo((props: RenderFragmentsContextType.LinkProps) => (
        <a href={props.href} target="_blank" rel="noopener noreferrer">
            {props.children}
        </a>
    )),
    Image: memo((props: RenderFragmentsContextType.ImageProps) =>
        props.width === 0 ? null : <img src={props.src} width={props.width} height={props.height} />,
    ),
    Metadata: memo(() => null),
}
export interface RenderFragmentsContextType {
    Container?: React.ComponentType<{}>
    Text?: React.ComponentType<RenderFragmentsContextType.TextProps>
    Image?: React.ComponentType<RenderFragmentsContextType.ImageProps>
    Metadata?: React.ComponentType<MetadataRenderProps>
    Link?: React.ComponentType<RenderFragmentsContextType.LinkProps>
    /** #topic */
    HashLink?: React.ComponentType<RenderFragmentsContextType.HashLinkProps>
    /** @user */
    AtLink?: React.ComponentType<RenderFragmentsContextType.AtLinkProps>
    /** $CASH */
    CashLink?: React.ComponentType<RenderFragmentsContextType.CashLinkProps>
}
export namespace RenderFragmentsContextType {
    export interface TextProps {
        children: string
    }
    export interface LinkProps {
        children: string
        href: string
    }
    export interface AtLinkProps {
        children: string
    }
    export interface CashLinkProps {
        children: string
    }
    export interface HashLinkProps {
        children: string
    }
    export interface ImageProps {
        src: string
        width?: number
        height?: number
        aspectRatio?: number
    }
}
export const RenderFragmentsContext = createContext<RenderFragmentsContextType>(DefaultRenderFragments)
