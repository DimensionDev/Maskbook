import { createContext, memo } from 'react'
import type { MetadataRenderProps } from '../MetadataRender.js'
import type { Meta } from '@masknet/typed-message'

export const DefaultRenderFragments = {
    Text: memo(function TextFragment(props: RenderFragmentsContextType.TextProps) {
        if (props.style) return <span style={props.style}>{props.children}</span>
        return <>{props.children}</>
    }),
    Link: memo(function LinkFragment(props: RenderFragmentsContextType.LinkProps) {
        return (
            <a
                href={props.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 'inherit', ...props.style }}>
                {props.children}
                {props.suggestedPostImage}
            </a>
        )
    }),
    Image: memo(function ImageFragment(props: RenderFragmentsContextType.ImageProps) {
        return props.width === 0 ?
                null
            :   <img src={props.src} width={props.width} height={props.height} style={props.style} />
    }),
    Metadata: memo(function MetadataFragment() {
        return null
    }),
}
export interface RenderFragmentsContextType {
    Container?: React.ComponentType
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
export declare namespace RenderFragmentsContextType {
    export interface TextProps {
        children: string
        style?: React.CSSProperties
    }
    export interface LinkProps {
        children: string
        style?: React.CSSProperties
        href: string
        suggestedPostImage: React.ReactNode | undefined
    }
    export interface AtLinkProps {
        children: string
        style?: React.CSSProperties
        suggestedPostImage: React.ReactNode | undefined
    }
    export interface CashLinkProps {
        children: string
        style?: React.CSSProperties
        suggestedPostImage: React.ReactNode | undefined
    }
    export interface HashLinkProps {
        children: string
        style?: React.CSSProperties
        suggestedPostImage: React.ReactNode | undefined
    }
    export interface ImageProps {
        src: string
        style?: React.CSSProperties
        width?: number
        height?: number
        aspectRatio?: number
        meta?: Meta
    }
}
export const RenderFragmentsContext = createContext<RenderFragmentsContextType>(DefaultRenderFragments)
RenderFragmentsContext.displayName = 'RenderFragmentsContext'
