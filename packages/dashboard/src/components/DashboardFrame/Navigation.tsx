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
    listItemTextClasses,
    useTheme,
} from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { startTransition, useContext } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { DashboardContext } from './context'
import {
    MaskBannerIcon,
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
                startTransition(() => {
                    navigate(to)
                })
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

const ItemIcon = styled(ListItemIcon)(({ theme }) => ({
    [`& svg`]: {
        fontSize: 36,
    },
}))

const ListSubTextItem = styled(ListItemText)(({ theme }) => ({
    [`&.${listItemTextClasses.inset}`]: {
        marginLeft: theme.spacing(2),
        '&:before': {
            content: '""',
            display: 'inline-block',
            width: 4,
            height: 4,
            borderRadius: 2,
            background: 'currentColor',
            position: 'absolute',
            left: theme.spacing(9),
            top: 22,
        },
    },
}))

export interface NavigationProps {}
export function Navigation({}: NavigationProps) {
    const { expanded, toggleNavigationExpand } = useContext(DashboardContext)
    const isWalletPath = useMatch(RoutePaths.Wallets)
    const isWalletTransferPath = useMatch(RoutePaths.WalletsTransfer)
    const isWalletHistoryPath = useMatch(RoutePaths.WalletsHistory)

    const isLargeScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'))
    const t = useDashboardI18N()
    const mode = useTheme().palette.mode

    return (
        <List>
            {isLargeScreen && <LogoItem>{mode === 'dark' ? <MaskBannerIcon /> : <MaskNotSquareIcon />}</LogoItem>}
            <ListItemLink to={RoutePaths.Personas}>
                <ItemIcon>{useMatch(RoutePaths.Personas) ? <MenuPersonasActiveIcon /> : <MenuPersonasIcon />}</ItemIcon>
                <ListItemText primary={t.personas()} />
            </ListItemLink>
            <ListItemLink to="" selected={!!useMatch(RoutePaths.Wallets)} onClick={toggleNavigationExpand}>
                <ItemIcon>
                    {isWalletPath || isWalletHistoryPath || isWalletTransferPath ? (
                        <MenuWalletsActiveIcon />
                    ) : (
                        <MenuWalletsIcon />
                    )}
                </ItemIcon>
                <ListItemText>{t.wallets()}</ListItemText>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemLink>
            <Collapse in={expanded}>
                <List disablePadding>
                    <ListItemLink to={RoutePaths.Wallets}>
                        <ListSubTextItem inset primary={t.wallets_assets()} />
                    </ListItemLink>
                    <ListItemLink to={RoutePaths.WalletsTransfer}>
                        <ListSubTextItem inset primary={t.wallets_transfer()} />
                    </ListItemLink>
                    <ListItemLink to={RoutePaths.WalletsHistory}>
                        <ListSubTextItem inset primary={t.wallets_history()} />
                    </ListItemLink>
                </List>
            </Collapse>
            <ListItemLink to={RoutePaths.Labs}>
                <ItemIcon>{useMatch(RoutePaths.Labs) ? <MenuLabsActiveIcon /> : <MenuLabsIcon />}</ItemIcon>
                <ListItemText primary={t.labs()} />
            </ListItemLink>
            <ListItemLink to={RoutePaths.Settings}>
                <ItemIcon sx={{ fontSize: 36 }}>
                    {useMatch(RoutePaths.Settings) ? <MenuSettingsActiveIcon /> : <MenuSettingsIcon />}
                </ItemIcon>
                <ListItemText primary={t.settings()} />
            </ListItemLink>
        </List>
    )
}
