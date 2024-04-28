import { memo } from 'react'
import { NavLink, type LinkProps } from 'react-router-dom'
import { BottomNavigationAction, Box, type BoxProps } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { PopupRoutes } from '@masknet/shared-base'
import { useMessages } from '@masknet/web3-hooks-base'

const useStyle = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2, 1.5),
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0,0.80)' : 'rgba(255, 255, 255, 0.80)',
        width: '100%',
        backdropFilter: 'blur(16px)',
        boxShadow: theme.palette.maskColor.bottomBg,
        borderRadius: '12px 12px 0 0',
    },
    action: {
        color: theme.palette.maskColor.third,
        height: '100%',
        minWidth: 94,
        padding: 6,
        boxSizing: 'border-box',
    },
    selected: {
        '& > button': {
            color: theme.palette.maskColor.highlight,
            filter: 'drop-shadow(0px 4px 10px rgba(0, 60, 216, 0.2))',
        },
    },
}))

const BottomNavLink = memo<LinkProps>(function BottomNavLink({ children, to }) {
    const { classes } = useStyle()

    return (
        <NavLink to={to} className={({ isActive }) => (isActive ? classes.selected : undefined)}>
            {children}
        </NavLink>
    )
})

export const Navigator = memo(function Navigator({ className, ...rest }: BoxProps) {
    const { classes, cx } = useStyle()

    const messages = useMessages()

    return (
        <Box className={cx(classes.container, className)} {...rest}>
            <BottomNavLink to={PopupRoutes.Personas}>
                <BottomNavigationAction
                    tabIndex={-1}
                    showLabel={false}
                    icon={<Icons.MaskMe size={28} />}
                    className={classes.action}
                />
            </BottomNavLink>
            <BottomNavLink to={PopupRoutes.Wallet}>
                <BottomNavigationAction
                    tabIndex={-1}
                    showLabel={false}
                    icon={messages.length ? <Icons.BusyWalletNav size={28} /> : <Icons.WalletNav size={28} />}
                    className={classes.action}
                />
            </BottomNavLink>
            <BottomNavLink to={PopupRoutes.Friends}>
                <BottomNavigationAction
                    tabIndex={-1}
                    showLabel={false}
                    icon={<Icons.Contacts size={28} />}
                    className={classes.action}
                />
            </BottomNavLink>
            <BottomNavLink to={PopupRoutes.Settings}>
                <BottomNavigationAction
                    className={classes.action}
                    tabIndex={-1}
                    showLabel={false}
                    icon={<Icons.Settings2 size={28} />}
                />
            </BottomNavLink>
        </Box>
    )
})
