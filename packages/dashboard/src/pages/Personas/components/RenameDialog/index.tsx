import { memo, useEffect, useState } from 'react'
import { MaskDialog } from '@masknet/theme'
import { Button, DialogActions, DialogContent, TextField } from '@material-ui/core'
import { useDashboardI18N } from '../../../../locales'
import { isPersonaNameLengthValid, PERSONA_NAME_MAX_LENGTH } from '../../../../utils/checkLengthExceed'

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
                    placeholder={t.personas_rename_placeholder()}
                    style={{ width: '100%' }}
                    error={!isPersonaNameLengthValid(name)}
                    helperText={
                        !isPersonaNameLengthValid(name)
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
