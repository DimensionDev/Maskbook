import { ThemeProvider } from '@mui/material'
import { useState } from 'react'
import { extendsTheme } from '../../../../utils/theme'
import type { BackupJSONFileLatest } from '../../../../utils/type-transform/BackupFormat/JSON/latest'
import { DashboardDialogCore, WrappedDialogProps } from '../Base'
import { ConfirmBackup } from './ConfirmBackup'
import { SelectBackup } from './SelectBackup'

const backupTheme = extendsTheme((theme) => ({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    '&[hidden]': {
                        visibility: 'hidden',
                    },
                },
            },
        },
    },
}))

enum RestoreStep {
    SelectBackup = 'select-backup',
    ConfirmBackup = 'confirm-backup',
}

export function DashboardRestoreDialog(props: WrappedDialogProps<object>) {
    const [step, setStep] = useState(RestoreStep.SelectBackup)
    const [backup, setBackup] = useState<BackupJSONFileLatest | null>(null)
    const [restoreId, setRestoreId] = useState('')

    function getCurrentStep(step: RestoreStep) {
        switch (step) {
            case RestoreStep.SelectBackup:
                return (
                    <SelectBackup
                        onConfirm={(restoreId: string, backup: BackupJSONFileLatest) => {
                            setBackup(backup)
                            setRestoreId(restoreId)
                            setStep(RestoreStep.ConfirmBackup)
                        }}
                    />
                )
            case RestoreStep.ConfirmBackup:
                return (
                    <ConfirmBackup
                        backup={backup}
                        restoreId={restoreId}
                        date={backup?._meta_.createdAt ?? 0}
                        onDone={props.onClose}
                    />
                )
            default:
                return null
        }
    }

    return (
        <ThemeProvider theme={backupTheme}>
            <DashboardDialogCore {...props}>{getCurrentStep(step)}</DashboardDialogCore>
        </ThemeProvider>
    )
}
