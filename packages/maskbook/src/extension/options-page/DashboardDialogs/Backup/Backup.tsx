import { Box, Button, Link } from '@material-ui/core'
import { useSnackbar } from '@masknet/theme'
import { Database as DatabaseIcon } from 'react-feather'
import { useAsync } from 'react-use'
import { useI18N } from '../../../../utils'
import Services from '../../../service'
import ActionButton from '../../DashboardComponents/ActionButton'
import { DatabasePreviewCard, DatabaseRecordType } from '../../DashboardComponents/DatabasePreviewCard'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import { useDatabaseStyles } from './style'

export function DashboardBackupDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const classes = useDatabaseStyles()
    const { enqueueSnackbar } = useSnackbar()

    const { value, loading } = useAsync(() => Services.Welcome.generateBackupJSON())

    // since Android doesn't support `browser.download.downloads`,
    //  we should create download url before click button.
    const backupInfo = useAsync(() => Services.Welcome.createBackupUrl({ download: false, onlyBackupWhoAmI: false }))

    const records = [
        { type: DatabaseRecordType.Persona, length: value?.personas.length ?? 0, checked: false },
        { type: DatabaseRecordType.Profile, length: value?.profiles.length ?? 0, checked: false },
        { type: DatabaseRecordType.Post, length: value?.posts.length ?? 0, checked: false },
        { type: DatabaseRecordType.Group, length: value?.userGroups.length ?? 0, checked: false },
        { type: DatabaseRecordType.Wallet, length: value?.wallets.length ?? 0, checked: false },
    ]

    const onConfirm = async () => {
        try {
            await Services.Welcome.createBackupFile({ download: true, onlyBackupWhoAmI: false })
            props.onClose()
        } catch (e) {
            enqueueSnackbar(t('set_up_backup_fail'), {
                variant: 'error',
            })
        }
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="medium"
                icon={<DatabaseIcon />}
                iconColor="#699CF7"
                primary={t('backup_database')}
                secondary={t('dashboard_backup_database_hint')}
                footer={
                    <Box
                        className={classes.root}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                        <DatabasePreviewCard
                            classes={{ table: classes.dashboardPreviewCardTable }}
                            dense
                            records={records}
                        />
                        {/* Hack: this is an un-dry and costly temperary solution, will be replaced later */}
                        {process.env.architecture === 'app' && process.env.target === 'firefox' ? (
                            backupInfo.loading || loading ? null : (
                                <Button
                                    component={Link}
                                    onClick={() => props.onClose()}
                                    variant="contained"
                                    href={backupInfo?.value?.url}
                                    download={backupInfo?.value?.fileName}>
                                    <span className={classes.buttonText}>
                                        {t('dashboard_backup_database_confirmation')}
                                    </span>
                                </Button>
                            )
                        ) : (
                            <ActionButton
                                loading={loading}
                                disabled={loading || records.every((r) => !r.length)}
                                variant="contained"
                                onClick={onConfirm}>
                                {t('dashboard_backup_database_confirmation')}
                            </ActionButton>
                        )}
                    </Box>
                }
            />
        </DashboardDialogCore>
    )
}
