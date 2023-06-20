import { memo } from 'react'
import { Button, Dialog, DialogActions, DialogContent, Typography, type DialogProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { formatPersonaFingerprint, type ProfileIdentifier } from '@masknet/shared-base'
import { LoadingButton } from '@mui/lab'
import { useI18N } from '../../../../../../utils/index.js'
import { Trans } from 'react-i18next'
import { PersonaContext } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 16,
        lineHeight: '22px',
        color: '#0F1419',
        textAlign: 'center',
    },
    content: {
        marginTop: 24,
        lineHeight: '20px',
        color: '#536471',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: theme.spacing(3),
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
}))

interface DisconnectDialogProps extends DialogProps {
    unbundledIdentity?: ProfileIdentifier
    onConfirmDisconnect: () => void
    confirmLoading: boolean
    onClose: () => void
}

export const DisconnectDialog = memo<DisconnectDialogProps>(
    ({ open, onClose, unbundledIdentity, onConfirmDisconnect, confirmLoading }) => {
        const { classes, cx } = useStyles()
        const { t } = useI18N()
        const { currentPersona } = PersonaContext.useContainer()
        if (!unbundledIdentity) return null

        return (
            <Dialog open={open}>
                <DialogContent>
                    <Typography className={classes.title}>{t('popups_new_persona_disconnect_confirmation')}</Typography>
                    <Typography className={classes.content}>
                        <Trans
                            i18nKey="popups_new_persona_disconnect_confirmation_description"
                            components={{ br: <br />, li: <li /> }}
                        />
                    </Typography>
                    <Typography className={classes.content}>
                        {`${t('popups_persona')}: `}
                        {formatPersonaFingerprint(currentPersona?.identifier.rawPublicKey ?? '', 10)}
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
