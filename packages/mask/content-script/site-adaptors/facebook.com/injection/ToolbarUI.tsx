import { styled, ListItemButton, Typography, ListItemIcon } from '@mui/material'
import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled.js'
import { useMemo } from 'react'

const Container = styled('div')`
    padding: 0 4px;
`
const ContainerHasNavBar = styled('div')`
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
    padding-left: 0.1rem;
`
const Icon = styled(ListItemIcon, {
    shouldForwardProp(name) {
        return name !== 'hasTopNavBar' && name !== 'hasSpecificLeftRailStartBar'
    },
})<{
    hasTopNavBar: boolean
    hasSpecificLeftRailStartBar: boolean
}>`
    min-width: ${(props) =>
        !props.hasSpecificLeftRailStartBar ? '24px'
        : props.hasTopNavBar ? '46px'
        : 'auto'};
    margin-right: ${(props) => (props.hasTopNavBar && props.hasSpecificLeftRailStartBar ? '0px' : '12px')};
    padding-left: 4px;
`

export function ToolboxAtFacebook(props: {
    category: 'wallet' | 'application'
    hasTopNavBar: boolean
    hasSpecificLeftRailStartBar: boolean
}) {
    const ListItemIcon = useMemo(() => {
        return ({ children }: React.PropsWithChildren) => (
            <Icon
                data-testid="abc"
                hasTopNavBar={props.hasTopNavBar}
                hasSpecificLeftRailStartBar={props.hasSpecificLeftRailStartBar}>
                {children}
            </Icon>
        )
    }, [props.hasTopNavBar, props.hasSpecificLeftRailStartBar])

    return (
        <ToolboxHintUnstyled
            iconSize={32}
            Container={props.hasTopNavBar ? ContainerHasNavBar : Container}
            ListItemButton={Item}
            Typography={Text}
            ListItemIcon={ListItemIcon}
            category={props.category}
        />
    )
}
