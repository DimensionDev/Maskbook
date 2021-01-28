import {
    List,
    ListItem,
    Box,
    ListItemText,
    ListItemIcon,
    Collapse,
    makeStyles,
    Theme,
    ListItemProps,
    useMediaQuery,
} from '@material-ui/core'
import { Masks, AccountBalanceWallet, ExpandLess, ExpandMore, Settings } from '@material-ui/icons'
import { useContext } from 'react'
import { useRouteMatch } from 'react-router'
import { Link, LinkProps } from 'react-router-dom'
import { Routes } from '../../pages/routes'
import { DashboardContext } from './context'

const useStyle = makeStyles((theme: Theme) => ({
    selected: {
        backgroundColor: 'transparent',
        borderRight: '4px solid ' + (theme.palette.mode === 'light' ? theme.palette.action.selected : 'white'),
        // Or?
        // borderRight: '4px solid ' + theme.palette.action.selected,
    },
    nested: { paddingLeft: theme.spacing(9) },
    logoItem: {
        paddingLeft: theme.spacing(7),
        marginBottom: theme.spacing(7.5),
    },
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
    const { expanded, toggleNavigationExpand } = useContext(DashboardContext)

    const matches = useMediaQuery<Theme>((theme) => theme.breakpoints.up(1184))
    return (
        <List>
            {matches && (
                <ListItem
                    component={Box}
                    sx={{ justifyContent: 'center', marginBottom: 2 }}
                    className={classes.logoItem}>
                    <img height={40} alt="Mask Logo" src="https://mask.io/assets/icons/logo.svg" />
                </ListItem>
            )}
            <ListItemLink to={Routes.Personas}>
                <ListItemIcon>
                    <Masks />
                </ListItemIcon>
                <ListItemText primary="Personas" />
            </ListItemLink>
            <ListItem
                button
                selected={!!useRouteMatch(Routes.Wallets)}
                classes={{ selected: classes.selected }}
                onClick={toggleNavigationExpand}>
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
