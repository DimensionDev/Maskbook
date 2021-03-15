import { Button, DialogContent, DialogContentText } from '@material-ui/core'
import type { FC } from 'react'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'

export interface HideDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
}

export const HideDialog: FC<HideDialogProps> = ({ open, onClose, onConfirm }) => {
    return (
        <InjectedDialog onClose={onClose} open={open} title="Hide NFT Token">
            <DialogContent>
                <DialogContentText>Hide Token</DialogContentText>
                <DialogContentText>[need fill content]</DialogContentText>
                <Button onClick={onConfirm} variant="contained" color="primary">
                    Confirm
                </Button>
                <Button onClick={onClose} variant="text">
                    Cancel
                </Button>
            </DialogContent>
        </InjectedDialog>
    )
}
