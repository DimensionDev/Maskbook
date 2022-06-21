import { InjectedDialog } from '@masknet/shared'
import { DialogActions, DialogContent } from '@mui/material'
import { useCallback, useState } from 'react'

export interface ApplicationsBoardProps {}

export function ApplicationsBoard(props: ApplicationsBoardProps) {
    const [open, setOpen] = useState(true)
    const [title, setTitle] = useState('Applications')
    const onClose = useCallback(() => {
        setOpen(false)
    }, [])

    console.log('DEBUG: applications board')

    return (
        <InjectedDialog title="Dock" keepMounted open={open} onClose={onClose}>
            <DialogContent>
                <h1>Applications Board Dialog</h1>
            </DialogContent>
            <DialogActions />
        </InjectedDialog>
    )
}
