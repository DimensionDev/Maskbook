import { styled, ListItemButton, Typography, ListItemIcon } from '@mui/material'
import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled.js'
import { useMemo } from 'react'

const Container = styled('div')({ padding: '0 4px' })
const ContainerHasNavBar = styled('div')({ padding: '0 8px' })

const Item = styled(ListItemButton)({
    borderRadius: 8,
    paddingLeft: 10,
})
const Text = styled(Typography)({
    fontSize: '0.9375rem',
    // This CSS variable is inherited from Facebook.
    color: 'var(--primary-text)',
    fontWeight: 500,
    paddingLeft: '0.1rem',
})
const Icon = styled(ListItemIcon, {
    shouldForwardProp(name) {
        return name !== 'hasTopNavBar' && name !== 'hasSpecificLeftRailStartBar'
    },
})<{
    hasTopNavBar: boolean
    hasSpecificLeftRailStartBar: boolean
}>(({ hasSpecificLeftRailStartBar, hasTopNavBar }) => ({
    minWidth:
        hasSpecificLeftRailStartBar ?
            hasTopNavBar ? 46
            :   'auto'
        :   24,
    marginRight: hasTopNavBar && hasSpecificLeftRailStartBar ? 0 : 12,
    paddingLeft: 4,
}))

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
