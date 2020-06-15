import React from 'react'
import { Box, createStyles, Theme, makeStyles } from '@material-ui/core'
import { Database as DatabaseIcon } from 'react-feather'
import { WrappedDialogProps, DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback } from './Base'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DatabaseRecordType, DatabasePreviewCard } from '../DashboardComponents/DatabasePreviewCard'
import { DebounceButton } from '../DashboardComponents/ActionButton'
import Services from '../../service'
import { useAsync } from 'react-use'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dashboardPreviewCardTable: {
            paddingLeft: 28,
            paddingRight: 28,
            marginBottom: 82,
        },
    }),
)

export function DashboardBackupDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const { value, loading } = useAsync(() => Services.Welcome.generateBackupJSON())
    const records = [
        { type: DatabaseRecordType.Persona, length: value?.personas.length ?? 0, checked: false },
        { type: DatabaseRecordType.Profile, length: value?.profiles.length ?? 0, checked: false },
        { type: DatabaseRecordType.Post, length: value?.posts.length ?? 0, checked: false },
        { type: DatabaseRecordType.Contact, length: value?.userGroups.length ?? 0, checked: false },
    ]

    const onConfirm = useSnackbarCallback(
        () => Services.Welcome.createBackupFile({ download: true, onlyBackupWhoAmI: false }),
        [],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="medium"
                icon={<DatabaseIcon />}
                iconColor="#699CF7"
                primary={t('backup_database')}
                secondary={t('dashboard_backup_database_hint')}
                footer={
                    <Box display="flex" flexDirection="column" alignItems="center" style={{ width: '100%' }}>
                        <DatabasePreviewCard
                            classes={{ table: classes.dashboardPreviewCardTable }}
                            dense
                            records={records}></DatabasePreviewCard>
                        <DebounceButton disabled={loading} variant="contained" color="primary" onClick={onConfirm}>
                            {t('dashboard_backup_database_confirmation')}
                        </DebounceButton>
                    </Box>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
