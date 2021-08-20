import {
    List,
    ListItem as MuiListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    Theme,
    useMediaQuery,
    styled,
    listItemClasses,
    listItemIconClasses,
    ListItemProps,
} from '@material-ui/core'
import { ExpandLess, ExpandMore } from '@material-ui/icons'
import { useContext } from 'react'
import { useMatch, useNavigate } from 'react-router'
import { DashboardContext } from './context'
import {
    MaskNotSquareIcon,
    MenuLabsActiveIcon,
    MenuLabsIcon,
    MenuPersonasActiveIcon,
    MenuPersonasIcon,
    MenuSettingsActiveIcon,
    MenuSettingsIcon,
    MenuWalletsActiveIcon,
    MenuWalletsIcon,
} from '@masknet/icons'
import { useDashboardI18N } from '../../locales'
import { MaskColorVar } from '@masknet/theme'
import { RoutePaths } from '../../type'

const ListItemLinkUnStyled = ({ to, ...props }: ListItemProps & { to: string }) => {
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

const ListItemLink = styled(ListItemLinkUnStyled)(({ theme }) => {
    return {
        [`&.${listItemClasses.root}`]: {
            color: theme.palette.mode === 'light' ? '' : 'rgba(255,255,255,.8)',
            paddingLeft: theme.spacing(2),
            cursor: 'pointer',
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
            <ListItemLink to={RoutePaths.Personas}>
                <ListItemIcon>
                    {useMatch(RoutePaths.Personas) ? <MenuPersonasActiveIcon /> : <MenuPersonasIcon />}
                </ListItemIcon>
                <ListItemText primary={t.personas()} />
            </ListItemLink>
            <ListItemLink
                to={RoutePaths.Wallets}
                selected={!!useMatch(RoutePaths.Wallets)}
                onClick={toggleNavigationExpand}>
                <ListItemIcon>
                    {useMatch(RoutePaths.Wallets) ? <MenuWalletsActiveIcon /> : <MenuWalletsIcon />}
                </ListItemIcon>
                <ListItemText>{t.wallets()}</ListItemText>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemLink>
            <Collapse in={expanded}>
                <List disablePadding>
                    <ListItemLink to={RoutePaths.WalletsTransfer}>
                        <ListItemText inset primary={t.wallets_transfer()} />
                    </ListItemLink>
                    <ListItemLink to={RoutePaths.WalletsHistory}>
                        <ListItemText inset primary={t.wallets_history()} />
                    </ListItemLink>
                </List>
            </Collapse>
            <ListItemLink to={RoutePaths.Labs}>
                <ListItemIcon>{useMatch(RoutePaths.Labs) ? <MenuLabsActiveIcon /> : <MenuLabsIcon />}</ListItemIcon>
                <ListItemText primary={t.labs()} />
            </ListItemLink>
            <ListItemLink to={RoutePaths.Settings}>
                <ListItemIcon>
                    {useMatch(RoutePaths.Settings) ? <MenuSettingsActiveIcon /> : <MenuSettingsIcon />}
                </ListItemIcon>
                <ListItemText primary={t.settings()} />
            </ListItemLink>
        </List>
    )
}
