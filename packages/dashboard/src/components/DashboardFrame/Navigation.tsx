import {
    List,
    ListItem as MuiListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    Theme,
    ListItemProps,
    useMediaQuery,
    experimentalStyled as styled,
    listItemClasses,
} from '@material-ui/core'
import { Masks, AccountBalanceWallet, ExpandLess, ExpandMore, Settings } from '@material-ui/icons'
import { useContext } from 'react'
import { useRouteMatch } from 'react-router'
import { Link, LinkProps } from 'react-router-dom'
import { Routes } from '../../pages/routes'
import { DashboardContext } from './context'
import { MaskNotSquareIcon } from '@dimensiondev/icons'
import { useDashboardI18N } from '../../locales'

function ListItemLinkUnStyled({ nested, ...props }: LinkProps & ListItemProps & { nested?: boolean; to: string }) {
    return <MuiListItem button component={Link} selected={!!useRouteMatch(props.to)} {...props} />
}

const ListItemLink = styled(ListItemLinkUnStyled)(({ theme, nested }) => ({
    [`&.${listItemClasses.root}`]: {
        paddingLeft: nested ? theme.spacing(9) : theme.spacing(2),
    },
    [`&.${listItemClasses.selected}`]: {
        backgroundColor: 'transparent',
        borderRight: '4px solid ' + (theme.palette.mode === 'light' ? theme.palette.action.selected : 'white'),
    },
}))

const LogoItem = (styled(MuiListItem)(({ theme }) => ({
    [`&.${listItemClasses.root}`]: {
        justifyContent: 'center',
        paddingLeft: theme.spacing(7),
        marginBottom: theme.spacing(3.5),
    },
})) as any) as typeof MuiListItem

const ListItem = styled(MuiListItem)(({ theme }) => ({
    [`&.${listItemClasses.selected}`]: {
        backgroundColor: 'transparent',
        borderRight: '4px solid ' + (theme.palette.mode === 'light' ? theme.palette.action.selected : 'white'),
    },
}))

export interface NavigationProps {}
export function Navigation({}: NavigationProps) {
    const { expanded, toggleNavigationExpand } = useContext(DashboardContext)

    const isLargeScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'))
    const t = useDashboardI18N()

    return (
        <List>
            {isLargeScreen && (
                <LogoItem>
                    <MaskNotSquareIcon />
                </LogoItem>
            )}
            <ListItemLink to={Routes.Personas}>
                <ListItemIcon>
                    <Masks />
                </ListItemIcon>
                <ListItemText primary={t.personas()} />
            </ListItemLink>
            <ListItem button selected={!!useRouteMatch(Routes.Wallets)} onClick={toggleNavigationExpand}>
                <ListItemIcon>
                    <AccountBalanceWallet />
                </ListItemIcon>
                <ListItemText>{t.wallets()}</ListItemText>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={expanded}>
                <List disablePadding>
                    <ListItemLink nested to={Routes.WalletsTransfer}>
                        <ListItemText primary={t.wallets_transfer()} />
                    </ListItemLink>
                    <ListItemLink nested to={Routes.WalletsSwap}>
                        <ListItemText primary={t.wallets_swap()} />
                    </ListItemLink>
                    <ListItemLink nested to={Routes.WalletsRedPacket}>
                        <ListItemText primary={t.wallets_red_packet()} />
                    </ListItemLink>
                    <ListItemLink nested to={Routes.WalletsSell}>
                        <ListItemText primary={t.wallets_sell()} />
                    </ListItemLink>
                    <ListItemLink nested to={Routes.WalletsHistory}>
                        <ListItemText primary={t.wallets_history()} />
                    </ListItemLink>
                </List>
            </Collapse>
            <ListItemLink to={Routes.Settings}>
                <ListItemIcon>
                    <Settings />
                </ListItemIcon>
                <ListItemText primary={t.settings()} />
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
