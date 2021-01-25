import {
    Box,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemProps,
    ListItemText,
    makeStyles,
    Theme,
    Toolbar,
    useMediaQuery,
} from '@material-ui/core'
import { Link, LinkProps } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import { useState } from 'react'
import { AccountBalanceWallet, ExpandLess, ExpandMore, Masks, Menu as MenuIcon, Settings } from '@material-ui/icons'
import { Routes } from '../../pages/routes'

const useStyle = makeStyles((theme: Theme) => ({
    selected: {
        backgroundColor: 'transparent',
        borderRight: '4px solid ' + (theme.palette.mode === 'light' ? theme.palette.action.selected : 'white'),
        // Or?
        // borderRight: '4px solid ' + theme.palette.action.selected,
    },
    nested: { paddingLeft: theme.spacing(9) },
}))
function ListItemLink({ nested, ...props }: LinkProps & ListItemProps & { nested?: boolean; to: string }) {
    const classes = useStyle()
    return (
        <ListItem
            button
            component={Link}
            classes={{ selected: classes.selected, root: nested ? classes.nested : void 0 }}
            selected={!!useRouteMatch(props.to)}
            {...props}
        />
    )
}

export interface NavigationProps {}

export function Navigation({}: NavigationProps) {
    const classes = useStyle()
    const [expanded, setExpanded] = useState(true)
    const matches = useMediaQuery<Theme>((theme) => theme.breakpoints.down(1184))

    const routerMatch = useRouteMatch(Routes.Wallets)
    return (
        <>

            <List>
                {!matches && <Toolbar />}
                <ListItemLink to={Routes.Personas}>
                    <ListItemIcon>
                        <Masks />
                    </ListItemIcon>
                    <ListItemText primary="Personas" />
                </ListItemLink>
                <ListItem
                    button
                    selected={!!routerMatch}
                    classes={{ selected: classes.selected }}
                    onClick={() => setExpanded((e) => !e)}>
                    <ListItemIcon>
                        <AccountBalanceWallet />
                    </ListItemIcon>
                    <ListItemText>Wallets</ListItemText>
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={expanded}>
                    <List disablePadding>
                        <ListItemLink nested to={Routes.WalletsTransfer}>
                            <ListItemText primary="Transfer" />
                        </ListItemLink>
                        <ListItemLink nested to={Routes.WalletsSwap}>
                            <ListItemText primary="Swap" />
                        </ListItemLink>
                        <ListItemLink nested to={Routes.WalletsRedPacket}>
                            <ListItemText primary="Red packet" />
                        </ListItemLink>
                        <ListItemLink nested to={Routes.WalletsSell}>
                            <ListItemText primary="Sell" />
                        </ListItemLink>
                        <ListItemLink nested to={Routes.WalletsHistory}>
                            <ListItemText primary="History" />
                        </ListItemLink>
                    </List>
                </Collapse>
                <ListItemLink to={Routes.Settings}>
                    <ListItemIcon>
                        <Settings />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                </ListItemLink>
            </List>
        </>
    )
}

export enum NavigationTarget {
    Personas,
    WalletsTransfer,
    WalletsSwap,
    Wallets,
    WalletsRedPacket,
    WalletsSell,
    WalletsHistory,
    Settings,
}
