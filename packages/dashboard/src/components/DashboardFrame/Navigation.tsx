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
import { useContext } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { DashboardContext } from './context'
import { Icon } from '@masknet/icons'
import { useDashboardI18N } from '../../locales'
import { MaskColorVar } from '@masknet/theme'
import { DashboardRoutes } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'

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

const ItemIcon = styled(ListItemIcon)(({ theme }) => ({
    '& svg': {
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
    const currentPluginId = useCurrentWeb3NetworkPluginID()

    const onExpand = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        toggleNavigationExpand()
    }

    return (
        <List onClick={() => onClose?.()}>
            {isLargeScreen && (
                <LogoItem>
                    <Icon type={mode === 'dark' ? 'maskBanner' : 'mask'} style={{ width: 130, height: 40 }} />
                </LogoItem>
            )}
            <ListItemLink to={DashboardRoutes.Personas}>
                <ItemIcon>
                    <Icon type={useMatch(DashboardRoutes.Personas) ? 'menuPersonasActive' : 'menuPersonas'} />
                </ItemIcon>
                <ListItemText primary={t.personas()} />
            </ListItemLink>
            <ListItemLink to="" selected={!!useMatch(DashboardRoutes.Wallets)} onClick={onExpand}>
                <ItemIcon>
                    <Icon
                        type={
                            isWalletPath || isWalletHistoryPath || isWalletTransferPath
                                ? 'menuWalletsActive'
                                : 'menuWallets'
                        }
                    />
                </ItemIcon>
                <ListItemText>{t.wallets()}</ListItemText>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemLink>
            <Collapse in={expanded}>
                <List disablePadding>
                    <ListItemLink to={DashboardRoutes.Wallets}>
                        <ListSubTextItem inset primary={t.wallets_assets()} />
                    </ListItemLink>
                    {currentPluginId === NetworkPluginID.PLUGIN_EVM && (
                        <ListItemLink to={DashboardRoutes.WalletsTransfer}>
                            <ListSubTextItem inset primary={t.wallets_transfer()} />
                        </ListItemLink>
                    )}
                    {currentPluginId === NetworkPluginID.PLUGIN_EVM && (
                        <ListItemLink to={DashboardRoutes.WalletsHistory}>
                            <ListSubTextItem inset primary={t.wallets_history()} />
                        </ListItemLink>
                    )}
                </List>
            </Collapse>
            <ListItemLink to={DashboardRoutes.Settings}>
                <ItemIcon sx={{ fontSize: 36 }}>
                    <Icon type={useMatch(DashboardRoutes.Settings) ? 'menuSettingsActive' : 'menuSettings'} />
                </ItemIcon>
                <ListItemText primary={t.settings()} />
            </ListItemLink>
        </List>
    )
}
