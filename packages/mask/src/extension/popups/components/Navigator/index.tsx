// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo } from 'react'
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material'
import { PersonasIcon, WalletNavIcon, DashboardIcon } from '@masknet/icons'
import { useMatch, useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { useEnterDashboard } from '../../hook/useEnterDashboard'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui'

enum NavRouter {
    Personas = 'Personas',
    Wallet = 'Wallets',
}

const useStyle = makeStyles()(() => ({
    label: {
        fontSize: '12px !important',
        color: '#ACB4C1',
    },
    selected: {
        color: '#1C68F3',
    },
    container: {
        backgroundColor: '#ffffff',
        width: '100%',
        position: 'fixed',
        bottom: 0,
    },
}))

export const Navigator = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { classes } = useStyle()
    const matchPersona = useMatch(`${PopupRoutes.Personas}/*`)
    const matchWallet = useMatch(`${PopupRoutes.Wallet}/*`)
    const onEnter = useEnterDashboard()

    return (
        <Box className={classes.container}>
            <BottomNavigation
                showLabels
                value={matchPersona ? NavRouter.Personas : matchWallet ? NavRouter.Wallet : null}>
                <BottomNavigationAction
                    label={t('personas')}
                    icon={<PersonasIcon />}
                    value={NavRouter.Personas}
                    onClick={() => navigate(PopupRoutes.Personas, { replace: true })}
                    classes={{ label: classes.label, selected: classes.selected }}
                />
                <BottomNavigationAction
                    label={t('wallet')}
                    icon={<WalletNavIcon />}
                    value={NavRouter.Wallet}
                    onClick={() => navigate(PopupRoutes.Wallet, { replace: true })}
                    classes={{ label: classes.label, selected: classes.selected }}
                />
                <BottomNavigationAction
                    label={t('dashboard')}
                    icon={<DashboardIcon />}
                    onClick={onEnter}
                    classes={{ label: classes.label, selected: classes.selected }}
                />
            </BottomNavigation>
        </Box>
    )
})
