import React from 'react'
import { DialogContentItem, DialogRouter } from './DialogBase'

import ActionButton from '../../../components/Dashboard/ActionButton'
import Services from '../../service'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'

export function DatabaseBackupDialog() {
    return (
        <DialogContentItem
            title="Backup Database"
            content="A file <Maskbook-Backup-2019.11.13.db> should appear in your downloads folder. Please keep the backup file carefully."
            actionsAlign="center"
            actions={
                <ActionButton variant="contained" color="primary">
                    Ok
                </ActionButton>
            }></DialogContentItem>
    )
}

export function DatabaseRestoreDialog() {
    const ref = React.useRef<HTMLInputElement>(null)
    const [restoreState, setRestoreState] = React.useState<'success' | Error | null>(null)
    const fileReceiver = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fr = new FileReader()
        fr.readAsText(e.currentTarget.files![0])
        fr.addEventListener('loadend', async () => {
            const str = fr.result as string
            try {
                const json = decompressBackupFile(str)
                await Services.Welcome.restoreBackup(json)
                setRestoreState('success')
            } catch (e) {
                console.error(e)
                setRestoreState(e)
            }
        })
    }
    return (
        <>
            <DialogContentItem
                title="Restore Database"
                content="Choose a backup file to restore your database."
                actionsAlign="center"
                actions={
                    <>
                        <input type="file" accept="application/json" ref={ref} onChange={fileReceiver} hidden />
                        <ActionButton variant="contained" color="primary" onClick={() => ref.current!.click()}>
                            Choose File
                        </ActionButton>
                    </>
                }></DialogContentItem>
            {restoreState === 'success' && (
                <DialogRouter children={<DatabaseRestoreSuccessDialog onConfirm={() => setRestoreState(null)} />} />
            )}
            {restoreState && restoreState !== 'success' && (
                <DialogRouter
                    children={
                        <DatabaseRestoreFailedDialog onConfirm={() => setRestoreState(null)} error={restoreState} />
                    }
                />
            )}
        </>
    )
}

interface DatabaseRestoreSuccessDialogProps {
    onConfirm(): void
}

export function DatabaseRestoreSuccessDialog({ onConfirm }: DatabaseRestoreSuccessDialogProps) {
    return (
        <DialogContentItem
            simplified
            title="Import Successful"
            content="Your database has been restored. Existing data will be merged."
            actions={
                <ActionButton variant="outlined" color="default" onClick={onConfirm}>
                    Ok
                </ActionButton>
            }></DialogContentItem>
    )
}

interface DatabaseRestoreFailedDialogProps {
    error: Error | string | null
    onConfirm(): void
}

export function DatabaseRestoreFailedDialog({ error, onConfirm }: DatabaseRestoreFailedDialogProps) {
    return (
        <DialogContentItem
            simplified
            title="Import Failed"
            content={typeof error === 'string' ? error : error?.message ?? 'Unknown Error'}
            actions={
                <ActionButton variant="outlined" color="default" onClick={onConfirm}>
                    Ok
                </ActionButton>
            }></DialogContentItem>
    )
}
