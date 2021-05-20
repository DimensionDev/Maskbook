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
    listItemIconClasses,
} from '@material-ui/core'
import { Masks, AccountBalanceWallet, ExpandLess, ExpandMore, Settings } from '@material-ui/icons'
import { useContext } from 'react'
import { useRouteMatch } from 'react-router'
import { Link, LinkProps } from 'react-router-dom'
import { Routes } from '../../type'
import { DashboardContext } from './context'
import { MaskNotSquareIcon } from '@dimensiondev/icons'
import { useDashboardI18N } from '../../locales'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

function ListItemLinkUnStyled({ nested, ...props }: LinkProps & ListItemProps & { nested?: boolean; to: string }) {
    return <MuiListItem button component={Link} selected={!!useRouteMatch(props.to)} {...props} />
}

const ListItemLink = styled(ListItemLinkUnStyled)(({ theme, nested }) => {
    return {
        [`&.${listItemClasses.root}`]: {
            color: theme.palette.mode === 'light' ? '' : 'rgba(255,255,255,.8)',
            paddingLeft: nested ? theme.spacing(9) : theme.spacing(2),
        },
        [`&.${listItemClasses.selected}`]: {
            color: MaskColorVar.textLink,
            backgroundColor: 'transparent',
            position: 'relative',
            [`${listItemIconClasses.root}`]: {
                color: MaskColorVar.textLink,
            },
            '&:after': {
                content: '""',
                display: 'inline-block',
                width: 5,
                height: 40,
                boxShadow: '-2px 0px 10px 2px rgba(0, 56, 255, 0.15)',
                borderRadius: 50,
                background: MaskColorVar.textLink,
                position: 'absolute',
                right: 0,
            },
        },
    }
})

const LogoItem = styled(MuiListItem)(({ theme }) => ({
    [`&.${listItemClasses.root}`]: {
        justifyContent: 'center',
        paddingLeft: theme.spacing(7),
        marginBottom: theme.spacing(3.5),
    },
})) as any as typeof MuiListItem

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
            <ListItemLink to={Routes.Wallets} onClick={toggleNavigationExpand}>
                <ListItemIcon>
                    <AccountBalanceWallet />
                </ListItemIcon>
                <ListItemText>{t.wallets()}</ListItemText>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemLink>
            <Collapse in={expanded}>
                <List disablePadding>
                    <ListItemLink nested to={Routes.WalletsTransfer}>
                        <ListItemText primary={t.wallets_transfer()} />
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
