// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo } from 'react'
import { Button, Dialog, DialogActions, DialogContent, Typography, DialogProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { formatPersonaFingerprint, PersonaInformation, type ProfileIdentifier } from '@masknet/shared-base'
import { LoadingButton } from '@mui/lab'
import { useI18N } from '../../../../../../utils/i18n-next-ui'

const useStyles = makeStyles()(() => ({
    title: {
        fontSize: 16,
        lineHeight: '22px',
        color: '#0F1419',
    },
    content: {
        marginTop: 24,
        fontSize: 14,
        lineHeight: '20px',
        color: '#536471',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        '& > *': {
            marginLeft: '0px !important',
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
        backgroundColor: '#F4212E',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#dc1e2a',
        },
    },
    cancelButton: {
        color: '#111418',
        border: '1px solid #CFD9DE',
    },
}))

interface DisconnectDialogProps extends DialogProps {
    unbundledIdentity?: ProfileIdentifier
    onConfirmDisconnect: () => void
    confirmLoading: boolean
    onClose: () => void
    currentPersona: PersonaInformation | undefined
}

export const DisconnectDialog = memo<DisconnectDialogProps>(
    ({ open, onClose, unbundledIdentity, onConfirmDisconnect, confirmLoading, currentPersona }) => {
        const { classes, cx } = useStyles()
        const { t } = useI18N()
        if (!unbundledIdentity) return null

        return (
            <Dialog open={open}>
                <DialogContent>
                    <Typography className={classes.title}>{t('popups_persona_disconnect_confirmation')}</Typography>
                    <Typography className={classes.content}>
                        {t('popups_persona_disconnect_confirmation_description')}
                    </Typography>
                    <Typography className={classes.content}>
                        {t('popups_persona')}:{' '}
                        {formatPersonaFingerprint(currentPersona?.identifier.compressedPoint ?? '', 10)}
                        <br />
                        {t('popups_twitter_id')}: @{unbundledIdentity.userId}
                    </Typography>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <LoadingButton
                        loading={confirmLoading}
                        className={cx(classes.button, classes.confirmButton)}
                        onClick={onConfirmDisconnect}>
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
