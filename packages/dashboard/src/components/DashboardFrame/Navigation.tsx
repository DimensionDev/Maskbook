import {
    List,
    ListItem as MuiListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    Theme,
    useMediaQuery,
    experimentalStyled as styled,
    listItemClasses,
    listItemIconClasses,
    ListItemProps,
} from '@material-ui/core'
import { Masks, AccountBalanceWallet, ExpandLess, ExpandMore, Settings } from '@material-ui/icons'
import { useContext } from 'react'
import { useMatch, useNavigate } from 'react-router'
import { DashboardContext } from './context'
import { MaskNotSquareIcon } from '@dimensiondev/icons'
import { useDashboardI18N } from '../../locales'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { RoutePaths } from '../../pages/routes'

const ListItemLinkUnStyled = ({ to, ...props }: ListItemProps & { to: string; nested?: boolean }) => {
    const navigate = useNavigate()
    return (
        <MuiListItem
            {...props}
            selected={!!useMatch(to)}
            onClick={(event) => {
                navigate(to)
                props.onClick?.(event)
            }}
        />
    )
}

const ListItemLink = styled(ListItemLinkUnStyled)(({ theme, nested }) => {
    return {
        [`&.${listItemClasses.root}`]: {
            color: theme.palette.mode === 'light' ? '' : 'rgba(255,255,255,.8)',
            paddingLeft: nested ? theme.spacing(9) : theme.spacing(2),
            cursor: 'pointer',
        },
        [`&.${listItemClasses.selected}`]: {
            color: MaskColorVar.linkText,
            backgroundColor: 'transparent',
            position: 'relative',
            [`${listItemIconClasses.root}`]: {
                color: MaskColorVar.linkText,
            },
            '&:after': {
                content: '""',
                display: 'inline-block',
                width: 5,
                height: 40,
                boxShadow: '-2px 0px 10px 2px rgba(0, 56, 255, 0.15)',
                borderRadius: 50,
                background: MaskColorVar.linkText,
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
            <ListItemLink to={RoutePaths.Personas}>
                <ListItemIcon>
                    <Masks />
                </ListItemIcon>
                <ListItemText primary={t.personas()} />
            </ListItemLink>
            <ListItemLink
                to={RoutePaths.Wallets}
                selected={!!useMatch(RoutePaths.Wallets)}
                onClick={toggleNavigationExpand}>
                <ListItemIcon>
                    <AccountBalanceWallet />
                </ListItemIcon>
                <ListItemText>{t.wallets()}</ListItemText>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemLink>
            <Collapse in={expanded}>
                <List disablePadding>
                    <ListItemLink nested to={RoutePaths.WalletsTransfer}>
                        <ListItemText primary={t.wallets_transfer()} />
                    </ListItemLink>
                    <ListItemLink nested to={RoutePaths.WalletsHistory}>
                        <ListItemText primary={t.wallets_history()} />
                    </ListItemLink>
                </List>
            </Collapse>
            <ListItemLink to={RoutePaths.Settings}>
                <ListItemIcon>
                    <Settings />
                </ListItemIcon>
                <ListItemText primary={t.settings()} />
            </ListItemLink>
        </List>
    )
}
