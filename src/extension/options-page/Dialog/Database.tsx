import React from 'react'
import { DashboardDialogWrapper } from './Base'
import { Database as DatabaseIcon } from 'react-feather'
import { Button } from '@material-ui/core'

export function DashboardDatabaseBackupDialog() {
    return (
        <DashboardDialogWrapper
            size="small"
            icon={<DatabaseIcon />}
            iconColor="#699CF7"
            primary="Backup Database"
            secondary="Create a database backup file. Do it frequently.">
            <Button variant="contained" color="primary">
                Ok, Back it up
            </Button>
        </DashboardDialogWrapper>
    )
}

export function DashboardDatabaseRestoreDialog() {
    return (
        <DashboardDialogWrapper
            size="small"
            icon={<DatabaseIcon />}
            iconColor="#699CF7"
            primary="Restore Database"
            secondary="Choose a backup file to restore your database.">
            <Button variant="contained" color="primary">
                Browse...
            </Button>
        </DashboardDialogWrapper>
    )
}
