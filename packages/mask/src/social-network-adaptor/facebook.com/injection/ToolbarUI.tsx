import { styled, ListItemButton, Typography, ListItemIcon, useMediaQuery } from '@mui/material'
import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled'

const fbBreakPoint = 700 /** px */

const Container = styled('div')<{ hasTopNavBar: boolean }>`
    padding: 0 ${(props) => (props.hasTopNavBar ? '8px' : '4px')};
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
const Icon = styled(ListItemIcon)<{ hasTopNavBar: boolean }>`
    min-width: ${(props) => (props.hasTopNavBar ? '46px' : 'auto')};
    margin-right: ${(props) => (props.hasTopNavBar ? '0px' : '12px')};
    @media screen and (max-height: ${fbBreakPoint}px) {
        min-width: ${(props) => (props.hasTopNavBar ? '36px' : 'auto')};
    }
`

export function ToolboxAtFacebook(props: { category: 'wallet' | 'application'; hasTopNavBar: boolean }) {
    const isSmall = useMediaQuery(`(max-height: ${fbBreakPoint}px)`)
    return (
        <ToolboxHintUnstyled
            iconSize={isSmall || !props.hasTopNavBar ? 24 : 32}
            Container={({ children }) => <Container hasTopNavBar={props.hasTopNavBar}>{children}</Container>}
            ListItemButton={Item}
            Typography={Text}
            ListItemIcon={({ children }) => <Icon hasTopNavBar={props.hasTopNavBar}>{children}</Icon>}
            category={props.category}
        />
    )
}
