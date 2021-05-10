import { memo, useEffect, useState } from 'react'
import { MaskDialog } from '../../../../../../theme'
import { Button, DialogActions, DialogContent, TextField } from '@material-ui/core'
import { checkInputLengthExceed } from '../../../../utils'
import { PERSONA_NAME_MAX_LENGTH } from '../../../../constants'
import { useDashboardI18N } from '../../../../locales'

export interface RenameDialogProps {
    open: boolean
    nickname?: string
    onClose: () => void
    onConfirm: (name: string) => void
}

export const RenameDialog = memo<RenameDialogProps>(({ open, nickname, onClose, onConfirm }) => {
    const t = useDashboardI18N()
    const [name, setName] = useState(nickname ?? '')

    useEffect(() => {
        setName(nickname ?? '')
    }, [open, nickname])
    return (
        <MaskDialog open={open} title={t.personas_rename()} onClose={onClose}>
            <DialogContent>
                <TextField
                    style={{ width: '100%' }}
                    variant="filled"
                    error={checkInputLengthExceed(name, PERSONA_NAME_MAX_LENGTH)}
                    helperText={
                        checkInputLengthExceed(name, PERSONA_NAME_MAX_LENGTH)
                            ? t.personas_name_maximum_tips({ length: String(PERSONA_NAME_MAX_LENGTH) })
                            : ''
                    }
                    InputProps={{ disableUnderline: true }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={onClose}>
                    {t.personas_cancel()}
                </Button>
                <Button onClick={() => onConfirm(name)}>{t.personas_confirm()}</Button>
            </DialogActions>
        </MaskDialog>
    )
})
