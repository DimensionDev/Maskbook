import { useState } from 'react'
import { useAsync } from 'react-use'
import { Button, Container, makeStyles, Stack } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'
import { MaskColorVar } from '@masknet/theme'
import { Services } from '../../API'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'
import { MaskAlert } from '../MaskAlert'
import FileUpload from '../FileUpload'

const useStyles = makeStyles((theme) => ({
    root: {
        border: `solid 1px ${theme.palette.divider}`,
        width: '100%',
        height: 176,
        borderRadius: 4,
        background: MaskColorVar.secondaryContrastText.alpha(0.15),
    },
    file: {
        display: 'none',
    },
}))

enum RestoreStatus {
    WaitingInput,
    Verifying,
    Verified,
}

export interface RestoreFromJsonProps {}

export function RestoreFromJson(props: RestoreFromJsonProps) {
    const t = useDashboardI18N()
    const classes = useStyles()

    const [json, setJSON] = useState<any | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [backupId, setBackupId] = useState('')
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.WaitingInput)

    useAsync(async () => {
        if (!backupValue) return

        setRestoreStatus(RestoreStatus.Verifying)
        const backupInfo = await Services.Welcome.parseBackupStr(backupValue)

        if (backupInfo) {
            setJSON(backupInfo.info)
            setBackupId(backupInfo.id)
            setRestoreStatus(RestoreStatus.Verified)
        } else {
            setRestoreStatus(RestoreStatus.WaitingInput)
            setBackupValue('')
        }
    }, [backupValue])

    const restoreDB = async () => {
        await Services.Welcome.checkPermissionsAndRestore(backupId)
    }

    return (
        <>
            <Container sx={{ marginBottom: '57px' }}>
                {restoreStatus === RestoreStatus.Verifying && <div className={classes.root}>Verifying</div>}
                {restoreStatus === RestoreStatus.WaitingInput && (
                    <Container sx={{ marginBottom: '57px' }}>
                        <FileUpload onChange={(_, content) => content && setBackupValue(content)} readAsText />
                    </Container>
                )}
                {restoreStatus === RestoreStatus.Verified && <BackupPreviewCard json={json} />}
            </Container>
            <Stack direction="row" spacing={2}>
                <Button sx={{ width: '224px' }} variant="rounded" color="secondary">
                    {t.wallets_import_wallet_cancel()}
                </Button>
                <Button
                    sx={{ width: '224px' }}
                    variant="rounded"
                    color="primary"
                    onClick={restoreDB}
                    disabled={restoreStatus !== RestoreStatus.Verified}>
                    {t.wallets_import_wallet_import()}
                </Button>
            </Stack>
            <Container sx={{ marginTop: '35px' }}>
                <MaskAlert description={t.sign_in_account_local_backup_warning()} />
            </Container>
        </>
    )
}
