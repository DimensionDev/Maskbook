// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo, type PropsWithChildren } from 'react'
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { NavLink } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'

const useStyle = makeStyles()((theme) => ({
    navigation: {
        height: 72,
        padding: '0 18px',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: theme.palette.maskColor.bottomBg,
        backdropFilter: 'blur(8px)',
    },
    iconOnly: {
        color: theme.palette.maskColor.third,
        height: '100%',
    },
    selected: {
        '& > button': {
            color: theme.palette.maskColor.highlight,
            filter: 'drop-shadow(0px 4px 10px rgba(0, 60, 216, 0.2))',
        },
    },
    container: {
        backgroundColor: theme.palette.maskColor.bottom,
        width: '100%',
        position: 'fixed',
        bottom: 0,
        backdropFilter: 'blur(8px)',
    },
}))

interface BottomNavLinkProps extends PropsWithChildren {
    to: string
}

const BottomNavLink = memo<BottomNavLinkProps>(function BottomNavLink({ children, to }) {
    const { classes } = useStyle()

    return (
        <NavLink to={to} className={({ isActive }) => (isActive ? classes.selected : undefined)}>
            {children}
        </NavLink>
    )
})

export const Navigator = memo(() => {
    const { classes } = useStyle()

    return (
        <Box className={classes.container}>
            <BottomNavigation classes={{ root: classes.navigation }}>
                <BottomNavLink to={PopupRoutes.Personas}>
                    <BottomNavigationAction
                        showLabel={false}
                        icon={<Icons.Me size={24} />}
                        className={classes.iconOnly}
                    />
                </BottomNavLink>
                <BottomNavLink to={PopupRoutes.Wallet}>
                    <BottomNavigationAction
                        showLabel={false}
                        icon={<Icons.WalletNav size={24} />}
                        className={classes.iconOnly}
                    />
                </BottomNavLink>
                <BottomNavLink to={PopupRoutes.Contracts}>
                    <BottomNavigationAction
                        showLabel={false}
                        icon={<Icons.Contacts size={24} />}
                        className={classes.iconOnly}
                    />
                </BottomNavLink>
                <BottomNavLink to={PopupRoutes.Settings}>
                    <BottomNavigationAction
                        showLabel={false}
                        icon={<Icons.Settings2 size={24} />}
                        className={classes.iconOnly}
                    />
                </BottomNavLink>
            </BottomNavigation>
        </Box>
    )
})
