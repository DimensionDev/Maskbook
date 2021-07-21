import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils'
import { RedPacketNftUI } from './RedPacketUI'

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
            <DialogContent>
                <RedPacketNftUI claim={true} />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" className={classes.button} onClick={onShare}>
                    {t('plugin_ito_dialog_swap_share_title')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
