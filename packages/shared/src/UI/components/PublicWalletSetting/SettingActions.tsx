import { Icons } from '@masknet/icons'
import { makeStyles, ActionButton } from '@masknet/theme'
import { alpha, Button } from '@mui/material'
import { memo } from 'react'
import { useSharedI18N } from '../../../locales/index.js'

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
    buttons: {
        display: 'flex',
        columnGap: 16,
    },
}))

interface SettingActionsProps {
    hasWallet: boolean
    onClose: () => void
    onOpenConnectWallet: () => void
    onConfirm: () => void
    disableConfirm: boolean
    confirmLoading: boolean
}

export const SettingActions = memo<SettingActionsProps>(
    ({ hasWallet, onOpenConnectWallet, onClose, disableConfirm, confirmLoading, onConfirm }) => {
        const { classes, cx } = useStyles()
        const t = useSharedI18N()
        if (!hasWallet) {
            return (
                <div className={classes.actions}>
                    <Button fullWidth startIcon={<Icons.ConnectWallet size={18} />} onClick={onOpenConnectWallet}>
                        {t.add_wallet()}
                    </Button>
                </div>
            )
        }

        return (
            <div className={cx(classes.actions, classes.buttons)}>
                <ActionButton variant="outlined" fullWidth onClick={onClose}>
                    {t.cancel()}
                </ActionButton>
                <ActionButton fullWidth disabled={disableConfirm} loading={confirmLoading} onClick={onConfirm}>
                    {t.save()}
                </ActionButton>
            </div>
        )
    },
)
