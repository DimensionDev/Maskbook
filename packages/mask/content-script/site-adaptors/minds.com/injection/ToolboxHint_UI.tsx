import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled.js'
import { Box, styled, ListItemButton, Typography, ListItemIcon, useMediaQuery } from '@mui/material'

const mindsBreakPoint = 1221 /** px */

const Container = styled(Box)({
    height: 45,
    marginBottom: 10,
    paddingLeft: 10,
})
const Item = styled(ListItemButton)({
    borderRadius: 8,
    height: 45,
    padding: '4px 12px 4px 0',
    color: 'var(--nav-text-color, #43434d) !important',
    '&:hover': {
        background: 'unset',
        color: 'var(--nav-text-color, #43434d)',
    },
    '[data-icon]': {
        color: '#43434d',
        '--icon-color': '#43434d',
    },
    "[data-icon='Wallet']": {
        color: 'var(--nav-text-color, #43434d)',
        '--icon-color': 'var(--nav-text-color, #43434d)',
    },
    [`@media screen and (max-width: ${mindsBreakPoint}px)`]: {
        padding: '12px 0',
        justifyContent: 'center',
    },
})
const Text = styled(Typography)({
    color: 'inherit !important',
    // Minds font
    fontFamily: 'Roboto, Helvetica, sans-serif',
    fontWeight: 700,
    fontSize: 19,
    lineHeight: '44px',
})
const Icon = styled(ListItemIcon)({
    color: 'inherit',
    minWidth: 45,
    marginLeft: 6,
    [`@media screen and (max-width: ${mindsBreakPoint}px)`]: {
        minWidth: 0,
    },
})

export function ToolboxHintAtMinds(props: { category: 'wallet' | 'application' }) {
    const mini = useMediaQuery(`(max-width: ${mindsBreakPoint}px)`)
    return (
        <ToolboxHintUnstyled
            sx={(theme) => ({
                '--nav-text-color': '#43434d',
                ...theme.applyStyles('dark', {
                    '--nav-text-color': '#fff',
                }),
            })}
            mini={mini}
            Container={Container}
            ListItemButton={Item}
            Typography={Text}
            ListItemIcon={Icon}
            category={props.category}
        />
    )
}
