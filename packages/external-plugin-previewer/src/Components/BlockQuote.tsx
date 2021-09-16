import type { Component } from './index'
import { styled } from '@mui/material'

const BlockQuote = styled('blockquote')`
    margin-inline-start: 0;
    border-left: 4px solid orange;
    padding-inline-start: 1.5em;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    opacity: 0.9;
`
export const MaskBlockQuote: Component<MaskCodeBlockProps> = (props) => {
    return (
        <BlockQuote>
            <slot />
        </BlockQuote>
    )
}
MaskBlockQuote.displayName = 'blockquote'
export interface MaskCodeBlockProps {}
