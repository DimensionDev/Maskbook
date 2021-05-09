import { memo, useEffect, useState } from 'react'
import { MaskDialog } from '../../../../../../theme'
import { Button, DialogActions, DialogContent, TextField } from '@material-ui/core'
import { checkInputLengthExceed } from '../../../../utils'
import { PERSONA_NAME_MAX_LENGTH } from '../../../../constants'

export interface RenameDialogProps {
    open: boolean
    nickname?: string
    onClose: () => void
    onConfirm: (name: string) => void
}

export const RenameDialog = memo<RenameDialogProps>(({ open, nickname, onClose, onConfirm }) => {
    const [name, setName] = useState(nickname ?? '')

    useEffect(() => {
        setName(nickname ?? '')
    }, [open, nickname])
    return (
        <MaskDialog open={open} title="Rename" onClose={onClose}>
            <DialogContent>
                <TextField
                    style={{ width: '100%' }}
                    variant="filled"
                    error={checkInputLengthExceed(name, PERSONA_NAME_MAX_LENGTH)}
                    helperText={
                        checkInputLengthExceed(name, PERSONA_NAME_MAX_LENGTH)
                            ? 'Maximum length is 24 characters long.'
                            : ''
                    }
                    InputProps={{ disableUnderline: true }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={() => onConfirm(name)}>Confirm</Button>
            </DialogActions>
        </MaskDialog>
    )
})
