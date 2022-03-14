import { useRemoteControlledDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { makeStyles, MaskDialog, useStylesExtends } from '@masknet/theme'
import { PluginGoPlusSecurityMessages } from '../messages'
import { useI18N } from '../locales'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '600px',
    },
    content: {
        width: '552px',
    },
}))

export interface BuyTokenDialogProps extends withClasses<never | 'root'> {}

export function CheckSecurityDialog(props: BuyTokenDialogProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    // #region remote controlled buy token dialog
    const { open, closeDialog } = useRemoteControlledDialog(
        PluginGoPlusSecurityMessages.checkSecurityDialogEvent,
        (ev) => {
            if (!ev.open) return
        },
    )
    // #endregion

    return (
        <MaskDialog title={t.dialog_title()} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>Plugin</DialogContent>
        </MaskDialog>
    )
}
