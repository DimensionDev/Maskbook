/// <reference types="react/canary" />
// ! This file is used during SSR. DO NOT import new files that does not work in SSR
import urlcat from 'urlcat'
import { createContext, memo, use, useCallback, useContext, useMemo, useRef } from 'react'
import { NavLink, type LinkProps } from 'react-router-dom'
import { BottomNavigationAction, Box, type BoxProps } from '@mui/material'
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
    container: {
        padding: theme.spacing(2, 1.5),
        backgroundColor: theme.palette.maskColor.bottom,
        width: '100%',
        backdropFilter: 'blur(8px)',
        background: theme.palette.maskColor.secondaryBottom,
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
    }, [!currentPersona])

    useContext(HydrateFinished)()

    return (
        <Box className={cx(classes.container, className)} {...rest}>
            <BottomNavLink to={PopupRoutes.Personas}>
                <BottomNavigationAction
                    tabIndex={-1}
                    showLabel={false}
                    icon={<Icons.Me size={28} />}
                    className={classes.action}
                />
            </BottomNavLink>
            <BottomNavLink to={walletLink}>
                <BottomNavigationAction
                    tabIndex={-1}
                    showLabel={false}
                    icon={<Icons.WalletNav size={28} />}
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

            <BottomNavigationAction
                onClick={onOpenDashboardSettings}
                showLabel={false}
                icon={<Icons.Settings2 size={28} />}
                className={classes.action}
            />
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
