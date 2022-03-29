import { styled, ListItemButton, Typography, ListItemIcon, useMediaQuery } from '@mui/material'
import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled'

const fbBreakPoint = 700 /** px */

const Container = styled('div')`
    padding: 0 8px;
`
const Item = styled(ListItemButton)`
    border-radius: 8px;
    padding-left: 10px;
`
const Text = styled(Typography)`
    font-size: 0.9375rem;
    /* This CSS variable is inherit from Facebook. */
    color: var(--primary-text);
    font-weight: 500;
`
const Icon = styled(ListItemIcon)`
    min-width: 46px;
    @media screen and (max-height: ${fbBreakPoint}px) {
        min-width: 36px;
    }
`

export function ToolboxAtFacebook() {
    const isSmall = useMediaQuery(`(max-height: ${fbBreakPoint}px)`)
    return (
        <ToolboxHintUnstyled
            iconSize={isSmall ? 24 : 32}
            Container={Container}
            ListItemButton={Item}
            Typography={Text}
            ListItemIcon={Icon}
        />
    )
}
