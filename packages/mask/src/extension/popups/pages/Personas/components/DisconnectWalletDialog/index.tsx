import { memo, useCallback } from 'react'
import { useMaskSharedTrans } from '../../../../../../utils/index.js'
import type { DialogProps } from '@mui/material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { makeStyles } from '@masknet/theme'
import { Trans } from 'react-i18next'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()(() => ({
    title: {
        fontSize: 16,
        lineHeight: '22px',
        color: '#0F1419',
        textAlign: 'center',
    },
    content: {
        marginTop: 8,
        lineHeight: '20px',
        color: '#536471',
        textAlign: 'center',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 24,
        '& > *': {
            marginLeft: '0 !important',
        },
    },
    button: {
        padding: '8px 0',
        width: '100%',
        borderRadius: 9999,
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '20px',
    },
    confirmButton: {
        backgroundColor: '#FFB100',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#ef9f00',
        },
    },
    cancelButton: {
        color: '#111418',
        border: '1px solid #CFD9DE',
    },
    strong: {
        fontWeight: 700,
        color: '#0f141a',
        fontSize: 16,
    },
}))

export interface DisconnectWalletDialogProps extends DialogProps {
    confirmLoading: boolean
    onConfirmDisconnect: () => Promise<void>
    address?: string
    onClose: () => void
    personaName?: string
}

export const DisconnectWalletDialog = memo<DisconnectWalletDialogProps>(
    ({ open, confirmLoading, onConfirmDisconnect, onClose, address, personaName }) => {
        const { classes, cx } = useStyles()
        const { t } = useMaskSharedTrans()

        const handleConfirm = useCallback(async () => {
            await onConfirmDisconnect()
            onClose()
        }, [onConfirmDisconnect])

        return (
            <Dialog open={open}>
                <DialogTitle className={classes.title}>{t('popups_delete_wallet')}?</DialogTitle>
                <DialogContent>
                    <Typography className={classes.content}>
                        <Trans
                            i18nKey="popups_disconnect_wallet_tip"
                            components={{ strong: <strong className={classes.strong} /> }}
                            values={{
                                persona: personaName,
                                address: formatEthereumAddress(address ?? '', 4),
                            }}
                        />
                    </Typography>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <LoadingButton
                        onClick={handleConfirm}
                        loading={confirmLoading}
                        className={cx(classes.button, classes.confirmButton)}>
                        {t('confirm')}
                    </LoadingButton>
                    <Button className={cx(classes.button, classes.cancelButton)} onClick={onClose}>
                        {t('cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    },
)
