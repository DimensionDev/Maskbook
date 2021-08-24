import { Box } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { green } from '@material-ui/core/colors'
import { useSnackbar } from '@masknet/theme'
import { useState } from 'react'
import { Database as DatabaseIcon } from 'react-feather'
import { useI18N, BackupJSONFileLatest } from '../../../../utils'
import Services from '../../../service'
import ActionButton from '../../DashboardComponents/ActionButton'
import { DatabasePreviewCard, DatabaseRecordType } from '../../DashboardComponents/DatabasePreviewCard'
import { DashboardDialogWrapper } from '../Base'

const useConfirmBackupStyles = makeStyles<{ imported: boolean }>()((_theme, props) => ({
    root: {
        width: '100%',
    },
    dashboardPreviewCardTable: {
        paddingLeft: 28,
        paddingRight: 28,
        marginBottom: 28,
        // keep dialogs vertical align when switching between them
        marginTop: props.imported ? 2 : 26,
    },
    doneButton: {
        color: '#fff',
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
}))
interface ConfirmBackupProps {
    backup: BackupJSONFileLatest | null
    date: number
    restoreId: string
    onDone?: () => void
}

export function ConfirmBackup({ restoreId, date, backup, onDone }: ConfirmBackupProps) {
    const [imported, setImported] = useState<boolean | 'loading'>(false)

    const { t } = useI18N()
    const { classes } = useConfirmBackupStyles({
        imported: imported === true,
    })
    const { enqueueSnackbar } = useSnackbar()

    const time = new Date(date ? Number(date) : 0)
    const records = [
        { type: DatabaseRecordType.Persona, length: backup?.personas.length ?? 0, checked: imported === true },
        { type: DatabaseRecordType.Profile, length: backup?.profiles.length ?? 0, checked: imported === true },
        { type: DatabaseRecordType.Post, length: backup?.posts.length ?? 0, checked: imported === true },
        { type: DatabaseRecordType.Wallet, length: backup?.wallets.length ?? 0, checked: imported === true },
    ]

    const onConfirm = async () => {
        const failToRestore = () => enqueueSnackbar(t('set_up_restore_fail'), { variant: 'error' })
        if (restoreId) {
            try {
                setImported('loading')
                await Services.Welcome.confirmBackup(restoreId)
                setImported(true)
            } catch {
                failToRestore()
                setImported(false)
            }
        } else {
            failToRestore()
        }
    }

    return (
        <DashboardDialogWrapper
            size="medium"
            icon={<DatabaseIcon />}
            iconColor="#699CF7"
            primary={t('restore_database')}
            secondary={
                imported === true
                    ? time.getTime() === 0
                        ? t('unknown_time')
                        : t('dashboard_restoration_successful_hint', {
                              time: time.toLocaleString(),
                          })
                    : t('set_up_restore_confirmation_hint')
            }
            footer={
                <Box
                    className={classes.root}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                    <DatabasePreviewCard
                        classes={{
                            table: classes.dashboardPreviewCardTable,
                        }}
                        records={records}
                    />
                    {imported === true ? (
                        <ActionButton className={classes.doneButton} variant="contained" onClick={onDone}>
                            {t('set_up_button_done')}
                        </ActionButton>
                    ) : (
                        <ActionButton
                            variant="contained"
                            loading={imported === 'loading'}
                            disabled={imported === 'loading'}
                            onClick={onConfirm}>
                            {t('set_up_button_confirm')}
                        </ActionButton>
                    )}
                </Box>
            }
        />
    )
}
