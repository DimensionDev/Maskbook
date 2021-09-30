import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled'
import { styled, ListItemButton, Typography, ListItemIcon, useMediaQuery } from '@mui/material'

const mindsBreakPoint = 1221 /** px */

const Container = styled('div')``
const Item = styled(ListItemButton)`
    border-radius: 8px;
    padding: 4px 12px 4px 0;
    color: #72727c;
    &:hover {
        background: unset;
        color: rgb(48, 153, 242);
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
    font-size: 17px;
    line-height: 44px;
`
const Icon = styled(ListItemIcon)`
    color: inherit;
    min-width: 48px;
    @media screen and (max-width: ${mindsBreakPoint}px) {
        min-width: 0;
    }
`

export function ToolboxHintAtMinds() {
    const mini = useMediaQuery(`(max-width: ${mindsBreakPoint}px)`)

    return (
        <ToolboxHintUnstyled
            mini={mini}
            Container={Container}
            ListItemButton={Item}
            Typography={Text}
            ListItemIcon={Icon}
        />
    )
}
