import { useCallback } from 'react'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import CloseIcon from '@material-ui/icons/Close'
import { PluginSnapshotMessages } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { DialogContent, IconButton } from '@material-ui/core'

export function VoteConfirmDialog() {
    //#region remote controlled buy token dialog
    const [open, setOpen] = useRemoteControlledDialog(
        PluginSnapshotMessages.events.voteConfirmDialogUpdated,
        (ev) => {},
    )
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    return (
        <div>
            <InjectedDialog open={open} onClose={onClose} DialogProps={{}} disableBackdropClick>
                <DialogContent>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                    this is vote confirm modal
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
