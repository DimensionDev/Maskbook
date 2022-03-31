import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { DialogContent } from '@mui/material'
export interface TipsEntranceDialogProps {
    open: boolean
    onClose?: () => void
}
export function TipsEntranceDialog({ open, onClose }: TipsEntranceDialogProps) {
    return (
        <InjectedDialog open={open}>
            <DialogContent>2222</DialogContent>
        </InjectedDialog>
    )
}
