import { type ProfileIdentifier } from '@masknet/shared-base'
import { type DialogProps, Dialog, DialogContent, Typography, DialogActions, Button } from '@mui/material'
import { memo, type ReactNode } from 'react'
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
        textAlign: 'center',
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
}))

interface DisconnectDialogProps extends DialogProps {
    unbundledIdentity?: ProfileIdentifier
    onSubmit?: () => Promise<void>
    onClose: () => void
    tips: ReactNode
}

export const DisconnectDialog = memo<DisconnectDialogProps>(({ open, onClose, onSubmit, title, tips }) => {
    const { classes } = useStyles()
    const { t } = useI18N()

    const [{ loading }, handleConfirm] = useAsyncFn(async () => onSubmit?.(), [onSubmit])

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent>
                <Typography className={classes.title}>{title}</Typography>
                <Typography className={classes.content}>{tips}</Typography>
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
})
