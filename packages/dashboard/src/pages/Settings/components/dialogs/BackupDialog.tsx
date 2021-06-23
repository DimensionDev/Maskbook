import ConfirmDialog from '../../../../components/ConfirmDialog'
import { ChangeEvent, useState } from 'react'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import { Services } from '../../../../API'
import { useAsync } from 'react-use'
import BackupPreviewCard from '../BackupPreviewCard'

export interface BackupDialogProps {
    open: boolean
    onClose(): void
}

export default function BackupDialog({ open, onClose }: BackupDialogProps) {
    const [checked, setChecked] = useState(true)

    const { value, loading } = useAsync(() => Services.Welcome.generateBackupPreviewInfo())

    const handleClose = () => {
        onClose()
    }
    const handleConfirm = async () => {
        try {
            await Services.Welcome.createBackupFile({ download: true, onlyBackupWhoAmI: false })
            onClose()
        } catch (e) {
            // TODO: show snack bar
            // enqueueSnackbar(t('set_up_backup_fail'), {
            //     variant: 'error',
            // })
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked)
    }

    return (
        <ConfirmDialog
            title="Global Backup"
            confirmText="Backup"
            open={open}
            confirmDisabled={loading}
            onClose={handleClose}
            onConfirm={handleConfirm}>
            <div style={{ flex: 1 }}>
                {value ? <BackupPreviewCard json={value} /> : null}
                <FormControlLabel
                    control={<Checkbox checked={checked} onChange={handleChange} />}
                    label="Encrypt with account password"
                />
            </div>
        </ConfirmDialog>
    )
}
