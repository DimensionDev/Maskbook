import { useContext, type MouseEvent } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import {
    List,
    ListItem as MuiListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    type Theme,
    useMediaQuery,
    styled,
    listItemClasses,
    listItemIconClasses,
    type ListItemProps,
    listItemTextClasses,
    useTheme,
} from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { DashboardContext } from './context.js'
import { Icons } from '@masknet/icons'
import { useDashboardI18N } from '../../locales/index.js'
import { MaskColorVar } from '@masknet/theme'
import { DashboardRoutes, NetworkPluginID } from '@masknet/shared-base'
import { useNetworkContext } from '@masknet/web3-hooks-base'

function ListItemLinkUnStyled({
    to,
    ...props
}: ListItemProps & {
    to: string
}) {
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
            '&:hover': {
                background: theme.palette.background.default,
            },
        },
        [`&.${listItemClasses.selected}`]: {
            color: MaskColorVar.textLink,
            backgroundColor: theme.palette.background.default,
            position: 'relative',
            [listItemIconClasses.root]: {
                color: MaskColorVar.textLink,
            },
            '&:after': {
                content: '""',
                display: 'inline-block',
                width: 5,
                height: 40,
                boxShadow: '-2px 0 10px 2px rgba(0, 56, 255, 0.15)',
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
        justifyContent: 'start',
        marginBottom: theme.spacing(3.5),
    },
})) as any as typeof MuiListItem

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

export interface NavigationProps {
    onClose?: () => void
}
export function Navigation({ onClose }: NavigationProps) {
    const { expanded, toggleNavigationExpand } = useContext(DashboardContext)
    const isWalletPath = useMatch(DashboardRoutes.Wallets)
    const isWalletTransferPath = useMatch(DashboardRoutes.WalletsTransfer)
    const isWalletHistoryPath = useMatch(DashboardRoutes.WalletsHistory)

    const isLargeScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'))
    const t = useDashboardI18N()
    const mode = useTheme().palette.mode
    const { pluginID } = useNetworkContext()

    const onExpand = (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        toggleNavigationExpand()
    }

    return (
        <List onClick={() => onClose?.()}>
            {isLargeScreen ? (
                <LogoItem>
                    {mode === 'dark' ? (
                        <Icons.MaskBanner width={130} height={40} />
                    ) : (
                        <Icons.Mask width={130} height={40} />
                    )}
                </LogoItem>
            ) : null}
            <ListItemLink to={DashboardRoutes.Personas}>
                <ListItemIcon>
                    {useMatch(DashboardRoutes.Personas) ? (
                        <Icons.MenuPersonasActive size={36} />
                    ) : (
                        <Icons.MenuPersonas size={36} />
                    )}
                </ListItemIcon>
                <ListItemText primary={t.personas()} />
            </ListItemLink>
            <ListItemLink to="" selected={!!useMatch(DashboardRoutes.Wallets)} onClick={onExpand}>
                <ListItemIcon>
                    {isWalletPath || isWalletHistoryPath || isWalletTransferPath ? (
                        <Icons.MenuWalletsActive size={36} />
                    ) : (
                        <Icons.MenuWallets size={36} />
                    )}
                </ListItemIcon>
                <ListItemText>{t.wallets()}</ListItemText>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemLink>
            <Collapse in={expanded}>
                <List disablePadding>
                    <ListItemLink to={DashboardRoutes.Wallets}>
                        <ListSubTextItem inset primary={t.wallets_assets()} />
                    </ListItemLink>
                    {pluginID === NetworkPluginID.PLUGIN_EVM && (
                        <ListItemLink to={DashboardRoutes.WalletsTransfer}>
                            <ListSubTextItem inset primary={t.wallets_transfer()} />
                        </ListItemLink>
                    )}
                    {pluginID === NetworkPluginID.PLUGIN_EVM && (
                        <ListItemLink to={DashboardRoutes.WalletsHistory}>
                            <ListSubTextItem inset primary={t.wallets_history()} />
                        </ListItemLink>
                    )}
                </List>
            </Collapse>
            <ListItemLink to={DashboardRoutes.Settings}>
                <ListItemIcon>
                    {useMatch(DashboardRoutes.Settings) ? (
                        <Icons.MenuSettingsActive size={36} />
                    ) : (
                        <Icons.MenuSettings size={36} />
                    )}
                </ListItemIcon>
                <ListItemText primary={t.settings()} />
            </ListItemLink>
        </List>
    )
}
