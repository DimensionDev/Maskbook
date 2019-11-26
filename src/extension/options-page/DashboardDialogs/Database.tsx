import React from 'react'
import { DialogContentItem } from './DialogBase'

import { Button } from '@material-ui/core'

export function DatabaseBackupDialog() {
    return (
        <DialogContentItem
            title="Backup Database"
            content="A file <Maskbook-Backup-2019.11.13.db> should appear in your downloads folder. Please keep the backup file carefully."
            actionsAlign="center"
            actions={
                <Button variant="contained" color="primary" className="actionButton">
                    Ok
                </Button>
            }></DialogContentItem>
    )
}

export function DatabaseRestoreDialog() {
    return (
        <DialogContentItem
            title="Restore Database"
            content="Choose a backup file to restore your database."
            actionsAlign="center"
            actions={
                <Button variant="contained" color="primary" className="actionButton">
                    Choose File
                </Button>
            }></DialogContentItem>
    )
}

export function DatabaseRestoreSuccessDialog() {
    return (
        <DialogContentItem
            simplified
            title="Import Successful"
            content="Your database has been restored. Existing data will be merged."
            actions={
                <Button variant="contained" color="primary" className="actionButton">
                    Choose File
                </Button>
            }></DialogContentItem>
    )
}

export function DatabaseRestoreFailedDialog() {
    return (
        <DialogContentItem
            simplified
            title="Import Failed"
            content="Choose a backup file to restore your database."
            actions={
                <Button variant="contained" color="primary" className="actionButton">
                    Choose File
                </Button>
            }></DialogContentItem>
    )
}
