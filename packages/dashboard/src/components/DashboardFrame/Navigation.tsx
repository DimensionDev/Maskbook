import {
    List,
    ListItem as MuiListItem,
    Box,
    ListItemText,
    ListItemIcon,
    Collapse,
    Theme,
    ListItemProps,
    useMediaQuery,
    experimentalStyled as styled,
    BoxProps,
} from '@material-ui/core'
import { Masks, AccountBalanceWallet, ExpandLess, ExpandMore, Settings } from '@material-ui/icons'
import { useContext } from 'react'
import { useRouteMatch } from 'react-router'
import { Link, LinkProps } from 'react-router-dom'
import { Routes } from '../../pages/routes'
import { DashboardContext } from './context'
import Logo from './Logo'

const ListItemLink = styled(({ nested, ...props }: LinkProps & ListItemProps & { nested?: boolean; to: string }) => (
    <MuiListItem button component={Link} selected={!!useRouteMatch(props.to)} {...props} />
))(({ theme, nested }) => ({
    '&.MuiListItem-root': {
        paddingLeft: nested ? theme.spacing(9) : theme.spacing(2),
    },
    '&.Mui-select': {
        backgroundColor: 'transparent',
        borderRight: '4px solid ' + (theme.palette.mode === 'light' ? theme.palette.action.selected : 'white'),
    },
}))

const LogoItem = styled((props: ListItemProps & BoxProps) => <MuiListItem component={Box} {...props} />)(
    ({ theme }) => ({
        '&.MuiListItem-root': {
            justifyContent: 'center',
            paddingLeft: theme.spacing(7),
            marginBottom: theme.spacing(7.5),
        },
    }),
)

const ListItem = styled(MuiListItem)(({ theme }) => ({
    '&.Mui-select': {
        backgroundColor: 'transparent',
        borderRight: '4px solid ' + (theme.palette.mode === 'light' ? theme.palette.action.selected : 'white'),
    },
}))

export interface NavigationProps {}
export function Navigation({}: NavigationProps) {
    const { expanded, toggleNavigationExpand } = useContext(DashboardContext)

    const isLargeScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'))

    return (
        <List>
            {isLargeScreen && (
                <LogoItem>
                    <Logo height={40} />
                </LogoItem>
            )}
            <ListItemLink to={Routes.Personas}>
                <ListItemIcon>
                    <Masks />
                </ListItemIcon>
                <ListItemText primary="Personas" />
            </ListItemLink>
            <ListItem button selected={!!useRouteMatch(Routes.Wallets)} onClick={toggleNavigationExpand}>
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
