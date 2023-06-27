import { type ProfileIdentifier, type PersonaInformation } from '@masknet/shared-base'
import { type DialogProps, Dialog, DialogContent, Typography, DialogActions, Button } from '@mui/material'
import { memo } from 'react'
import { Trans } from 'react-i18next'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useAsyncFn } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 16,
        lineHeight: '20px',
        textAlign: 'center',
    },
    content: {
        marginTop: 24,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
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
    strong: {
        color: theme.palette.maskColor.main,
    },
}))

interface DisconnectDialogProps extends DialogProps {
    unbundledIdentity?: ProfileIdentifier
    onSubmit?: () => Promise<void>
    onClose: () => void
    currentPersona?: PersonaInformation
}

export const DisconnectDialog = memo<DisconnectDialogProps>(
    ({ open, onClose, unbundledIdentity, onSubmit, currentPersona }) => {
        const { classes } = useStyles()
        const { t } = useI18N()

        const [{ loading }, handleConfirm] = useAsyncFn(async () => onSubmit?.(), [onSubmit])
        if (!unbundledIdentity) return null

        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent>
                    <Typography className={classes.title}>{t('popups_new_persona_disconnect_confirmation')}</Typography>
                    <Typography className={classes.content}>
                        <Trans
                            i18nKey="popups_persona_disconnect_tips"
                            components={{ strong: <strong className={classes.strong} /> }}
                            values={{ identity: unbundledIdentity.userId, personaName: currentPersona?.nickname }}
                        />
                    </Typography>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <ActionButton
                        fullWidth
                        loading={loading}
                        variant="roundedContained"
                        color="warning"
                        onClick={handleConfirm}>
                        {t('confirm')}
                    </ActionButton>
                    <Button fullWidth onClick={onClose} variant="roundedOutlined">
                        {t('cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    },
)
