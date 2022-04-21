import { memo } from 'react'
import { Button, Dialog, DialogActions, DialogContent, Typography, DialogProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { formatPersonaFingerprint, type ProfileIdentifier } from '@masknet/shared-base'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { LoadingButton } from '@mui/lab'
import { useI18N } from '../../../../../../utils'

const useStyles = makeStyles()(() => ({
    title: {
        fontSize: 16,
        lineHeight: '22px',
        color: '#0F1419',
        textAlign: 'center',
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
}))

interface DisconnectDialogProps extends DialogProps {
    unbundledIdentity?: ProfileIdentifier
    onConfirmDisconnect: () => void
    confirmLoading: boolean
    onClose: () => void
}

export const DisconnectDialog = memo<DisconnectDialogProps>(
    ({ open, onClose, unbundledIdentity, onConfirmDisconnect, confirmLoading }) => {
        const { classes } = useStyles()
        const { t } = useI18N()
        const { currentPersona } = PersonaContext.useContainer()
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
                        className={classNames(classes.button, classes.confirmButton)}
                        onClick={onConfirmDisconnect}>
                        {t('confirm')}
                    </LoadingButton>
                    <Button className={classNames(classes.button, classes.cancelButton)} onClick={onClose}>
                        {t('cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    },
)
