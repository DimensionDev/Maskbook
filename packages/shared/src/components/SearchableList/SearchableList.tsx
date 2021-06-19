import { MaskDialog } from '@dimensiondev/maskbook-theme'
import { TextField } from '@material-ui/core'
import { DialogActions, DialogContent, DialogContentText, Button } from '@material-ui/core'

export interface MaskSearchableListProps {
    data: string[]
    title: string
    open: boolean
    loading?: boolean
    onSelect(): void
}

export const SearchableList: React.FC<MaskSearchableListProps> = ({ data, title, open, loading, children }) => {
    return (
        <MaskDialog title={title} onClose={() => {}} open={open}>
            <DialogContent>
                <TextField label={'Search'} autoFocus fullWidth />
                <DialogContentText>{children}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button>Confirm</Button>
            </DialogActions>
        </MaskDialog>
    )
}
