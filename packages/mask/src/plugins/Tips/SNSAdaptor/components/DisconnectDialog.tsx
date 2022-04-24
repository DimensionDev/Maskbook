import { memo, useCallback } from 'react'
import type { DialogProps } from '@mui/material'
import { DialogContent, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { Trans } from 'react-i18next'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import { InjectedDialog } from '@masknet/shared'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
    content: {
        width: '320px',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        boxSizing: 'border-box',
        padding: 24,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: theme.palette.background.default,
        borderRadius: 14,
        textAlign: 'center',
    },
    title: {
        fontSize: 14,
        lineHeight: '22px',
        color: theme.palette.text.primary,
        fontWeight: 500,
        marginBottom: 24,
    },
    actions: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },

    button: {
        padding: '8px 0',
        width: '100%',
        borderRadius: 99,
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '20px',
    },
    confirmButton: {
        marginTop: 56,
        backgroundColor: '#FFB100',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#ef9f00',
        },
    },
    cancelButton: {
        border: '1px solid rgba(47, 51, 54, 1)',
    },
    strong: {
        fontWeight: 700,
        color: theme.palette.text.primary,
        fontSize: 16,
    },
}))

export interface DisconnectWalletDialogProps extends DialogProps {
    confirmLoading: boolean
    onConfirmDisconnect: () => Promise<boolean>
    address?: string
    onClose: () => void
    personaName: string | undefined
}

export const DisconnectWalletDialog = memo<DisconnectWalletDialogProps>(
    ({ open, confirmLoading, onConfirmDisconnect, onClose, address, personaName }) => {
        const { classes } = useStyles()
        const { t } = useI18N()

        const handleConfirm = useCallback(async () => {
            await onConfirmDisconnect()
            onClose()
        }, [onConfirmDisconnect, address])

        return (
            <InjectedDialog open={open}>
                <DialogContent className={classes.content}>
                    <Typography className={classes.title}>{t('plugin_tips_disconnect_dialog_title')}</Typography>
                    <Typography>
                        <Trans
                            i18nKey="plugin_tips_disconnect_introduction"
                            components={{ strong: <span className={classes.strong} /> }}
                            values={{
                                persona: personaName,
                                address: formatEthereumAddress(address ?? '', 4),
                            }}
                        />
                    </Typography>
                    <div className={classes.actions}>
                        <LoadingButton
                            fullWidth
                            onClick={handleConfirm}
                            loading={confirmLoading}
                            className={classNames(classes.button, classes.confirmButton)}>
                            {t('confirm')}
                        </LoadingButton>
                        <ActionButton
                            className={classNames(classes.button, classes.cancelButton)}
                            fullWidth
                            color="secondary"
                            onClick={onClose}>
                            {t('cancel')}
                        </ActionButton>
                    </div>
                </DialogContent>
            </InjectedDialog>
        )
    },
)
