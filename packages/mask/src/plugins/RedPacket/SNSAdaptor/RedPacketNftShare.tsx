import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    button: {
        width: '100%',
        padding: theme.spacing(0.5, 6),
        marginTop: theme.spacing(2),
        minHeight: 28,
    },
}))
export interface RedPacketNftShareDialogProps {
    open: boolean
    onClose: () => void
    onShare?: () => void
}
export function RedPacketNftShareDialog(props: RedPacketNftShareDialogProps) {
    const { open, onClose, onShare } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <InjectedDialog open={open} title={t('plugin_ito_dialog_swap_share_title')} onClose={onClose}>
            <DialogContent />
            <DialogActions>
                <Button color="primary" className={classes.button} onClick={onShare}>
                    {t('plugin_ito_dialog_swap_share_title')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
