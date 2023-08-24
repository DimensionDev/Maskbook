/// <reference types="react/canary" />
// ! This file is used during SSR. DO NOT import new files that does not work in SSR
import urlcat from 'urlcat'
import { createContext, memo, use, useCallback, useContext, useMemo, useRef } from 'react'
import { NavLink, type LinkProps } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Box, type BoxProps } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { DashboardRoutes, PopupRoutes } from '@masknet/shared-base'
import { useMessages, useWallet } from '@masknet/web3-hooks-base'
import { useHasPassword } from '../../hooks/index.js'
import { useWalletLockStatus } from '../../pages/Wallet/hooks/useWalletLockStatus.js'
import { HydrateFinished } from '../../../../utils/createNormalReactRoot.js'
import Services from '../../../service.js'
import { useCurrentPersona } from '../../../../components/DataSource/useCurrentPersona.js'

const useStyle = makeStyles()((theme) => ({
    navigation: {
        height: 72,
        padding: 0,
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: theme.palette.maskColor.bottomBg,
        backdropFilter: 'blur(8px)',
    },
    iconOnly: {
        color: theme.palette.maskColor.third,
        height: '100%',
        minWidth: 94,
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
        backdropFilter: 'blur(8px)',
    },
}))

const BottomNavLink = memo<LinkProps>(function BottomNavLink({ children, to }) {
    const { classes } = useStyle()

    return (
        <NavLink to={to} className={({ isActive }) => (isActive && to !== '#' ? classes.selected : undefined)}>
            {children}
        </NavLink>
    )
})

export const Navigator = memo(function Navigator({ className, ...rest }: BoxProps) {
    const { classes, cx } = useStyle()
    const walletLink = useRef(use(WalletLinkContext)).current()

    const currentPersona = useCurrentPersona()

    const onOpenDashboardSettings = useCallback(async () => {
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(
                `/dashboard.html#${currentPersona ? DashboardRoutes.Settings : DashboardRoutes.SignUpPersona}`,
            ),
        })
        if (navigator.userAgent.includes('Firefox')) {
            window.close()
        }
        await Services.Helper.removePopupWindow()
    }, [currentPersona])

    useContext(HydrateFinished)()

    return (
        <Box className={cx(classes.container, className)} {...rest}>
            <BottomNavigation classes={{ root: classes.navigation }}>
                <BottomNavLink to={PopupRoutes.Personas}>
                    <BottomNavigationAction
                        showLabel={false}
                        icon={<Icons.Me size={28} />}
                        className={classes.iconOnly}
                    />
                </BottomNavLink>
                <BottomNavLink to={walletLink}>
                    <BottomNavigationAction
                        showLabel={false}
                        icon={<Icons.WalletNav size={28} />}
                        className={classes.iconOnly}
                    />
                </BottomNavLink>
                <BottomNavLink to={PopupRoutes.Friends}>
                    <BottomNavigationAction
                        showLabel={false}
                        icon={<Icons.Contacts size={28} />}
                        className={classes.iconOnly}
                    />
                </BottomNavLink>

                <BottomNavigationAction
                    onClick={onOpenDashboardSettings}
                    showLabel={false}
                    icon={<Icons.Settings2 size={28} />}
                    className={classes.iconOnly}
                />
            </BottomNavigation>
        </Box>
    )
})

export const WalletLinkContext = createContext(function useWalletLink() {
    const wallet = useWallet()
    const messages = useMessages()
    const { isLocked, loading: lockStatusLoading } = useWalletLockStatus()
    const { hasPassword, loading: hasPasswordLoading } = useHasPassword()
    const walletPageLoading = lockStatusLoading || hasPasswordLoading
    const walletLink = useMemo(() => {
        if (walletPageLoading) return '#'
        if (!wallet) return PopupRoutes.Wallet
        if (!hasPassword) return PopupRoutes.SetPaymentPassword
        if (isLocked)
            return urlcat(PopupRoutes.Unlock, { from: messages.length ? PopupRoutes.ContractInteraction : undefined })
        if (messages.length) return PopupRoutes.ContractInteraction
        return PopupRoutes.Wallet
    }, [wallet, walletPageLoading, isLocked, hasPassword, messages])
    return walletLink
})
