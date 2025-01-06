import type { CSSProperties } from 'react'
import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled.js'
import { styled, ListItemButton, Typography, ListItemIcon, useMediaQuery, useTheme } from '@mui/material'

const mindsBreakPoint = 1221 /** px */

const Container = styled('div')`
    height: 45px;
    margin-bottom: 10px;
    padding-left: 10px;
`
const Item = styled(ListItemButton)`
    border-radius: 8px;
    height: 45px;
    padding: 4px 12px 4px 0;
    color: var(--nav-text-color, #43434d) !important;
    &:hover {
        background: unset;
        color: var(--nav-text-color, #43434d);
    }
    [data-icon] {
        color: #43434d;
        --icon-color: #43434d;
    }
    [data-icon='Wallet'] {
        color: var(--nav-text-color, #43434d);
        --icon-color: var(--nav-text-color, #43434d);
    }
    @media screen and (max-width: ${mindsBreakPoint}px) {
        padding: 12px 0;
        justify-content: center;
    }
`
const Text = styled(Typography)`
    font-size: 0.9375rem;
    font-weight: 500;
    color: inherit !important;
    /* Minds font */
    font-family: Roboto, Helvetica, sans-serif;
    font-weight: 700;
    font-size: 19px;
    line-height: 44px;
`
const Icon = styled(ListItemIcon)`
    color: inherit;
    min-width: 45px;
    margin-left: 6px;
    @media screen and (max-width: ${mindsBreakPoint}px) {
        min-width: 0;
    }
`

export function ToolboxHintAtMinds(props: { category: 'wallet' | 'application' }) {
    const mini = useMediaQuery(`(max-width: ${mindsBreakPoint}px)`)
    const theme = useTheme()

    return (
        <ToolboxHintUnstyled
            style={
                {
                    '--nav-text-color': theme.palette.mode === 'dark' ? '#fff' : '#43434d',
                } as CSSProperties
            }
            mini={mini}
            Container={Container}
            ListItemButton={Item}
            Typography={Text}
            ListItemIcon={Icon}
            category={props.category}
        />
    )
}
