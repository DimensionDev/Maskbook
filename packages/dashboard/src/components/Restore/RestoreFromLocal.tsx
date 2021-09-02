import { useCallback, useState } from 'react'
import { useAsync, useToggle } from 'react-use'
import { Box, Button, Card } from '@material-ui/core'
import { makeStyles, MaskTextField } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { MaskColorVar, useSnackbar } from '@masknet/theme'
import { Services } from '../../API'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'
import { MaskAlert } from '../MaskAlert'
import FileUpload from '../FileUpload'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'
import { blobToText } from '@dimensiondev/kit'
import { LoadingCard } from './steps/LoadingCard'

const useStyles = makeStyles()((theme) => ({
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
    WaitingInput = 0,
    Verifying = 1,
    Verified = 2,
}

export interface RestoreFromJsonProps {}

export function RestoreFromLocal(props: RestoreFromJsonProps) {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()

    const [json, setJSON] = useState<any | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [backupId, setBackupId] = useState('')
    const [needPassword, togglePasswordField] = useToggle(false)
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.WaitingInput)

    const handleSetFile = useCallback(async (file: File) => {
        if (file.type === 'json') {
            const content = await blobToText(file)
            setBackupValue(content)
        } else {
            togglePasswordField(true)
            setRestoreStatus(RestoreStatus.Verifying)
        }
    }, [])

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
        if (needPassword) {
            return
        }
        try {
            await Services.Welcome.checkPermissionsAndRestore(backupId)
            navigate(RoutePaths.Personas, { replace: true })
        } catch {
            enqueueSnackbar('Restore backup failed, Please try again', { variant: 'error' })
        }
    }

    return (
        <>
            <Box sx={{ width: '100%' }}>
                {restoreStatus === RestoreStatus.Verifying && <LoadingCard text="Verifying" />}
                {restoreStatus === RestoreStatus.WaitingInput && (
                    <Card variant="background" sx={{ height: '144px' }}>
                        <FileUpload onChange={handleSetFile} />
                    </Card>
                )}
                {restoreStatus === RestoreStatus.Verified && <BackupPreviewCard json={json} />}

                {needPassword && (
                    <Box sx={{ mt: 4 }}>
                        <MaskTextField
                            placeholder={t.sign_in_account_cloud_backup_password()}
                            type="password"
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            error={!!error}
                            helperText={error}
                        />
                    </Box>
                )}
            </Box>
            <ButtonContainer>
                <Button variant="rounded" color="primary" onClick={restoreDB}>
                    {restoreStatus !== RestoreStatus.Verified ? t.next() : t.restore()}
                </Button>
            </ButtonContainer>
            <Box sx={{ marginTop: '35px', width: '100%' }}>
                <MaskAlert description={t.sign_in_account_local_backup_warning()} />
            </Box>
        </>
    )
}
