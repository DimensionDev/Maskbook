import { Icons } from '@masknet/icons'
import { useAccount } from '@masknet/plugin-infra/web3'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { alpha, Button } from '@mui/material'
import { memo, useCallback } from 'react'
import Services from '../../../../extension/service'
import { useI18N } from '../../locales'

const useStyles = makeStyles()((theme) => ({
    actions: {
        position: 'sticky',
        bottom: 0,
        left: 0,
        padding: 16,
        backgroundColor: alpha(theme.palette.maskColor.bottom, 0.8),
        boxSizing: 'border-box',
        width: '100%',
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12)',
    },
}))

interface SettingActionsProps {}

export const SettingActions = memo(() => {
    const account = useAccount()

    const onOpenConnectWallet = useCallback(() => Services.Helper.openPopupWindow(PopupRoutes.ConnectWallet), [])

    return <SettingActionsUI hasWallet={!!account} onOpenConnectWallet={onOpenConnectWallet} />
})

interface SettingActionsUIProps {
    hasWallet: boolean
    onOpenConnectWallet: () => void
}

export const SettingActionsUI = memo<SettingActionsUIProps>(({ hasWallet, onOpenConnectWallet }) => {
    const { classes } = useStyles()
    const t = useI18N()
    if (!hasWallet) {
        return (
            <div className={classes.actions}>
                <Button fullWidth startIcon={<Icons.ConnectWallet size={18} />} onClick={onOpenConnectWallet}>
                    {t.add_wallet()}
                </Button>
            </div>
        )
    }

    return <div className={classes.actions}>test</div>
})
