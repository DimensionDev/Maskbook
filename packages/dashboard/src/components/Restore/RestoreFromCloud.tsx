import { memo, useEffect, useMemo, useState } from 'react'
import { useDashboardI18N } from '../../locales'
import { Box, Button } from '@material-ui/core'
import { MaskAlert } from '../MaskAlert'
import { CodeValidation } from './CodeValidation'
import { fetchBackupValue } from '../../pages/Settings/api'
import { Services } from '../../API'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'
import { ButtonGroup } from '../RegisterFrame/ButtonGroup'
import { useSnackbar } from '@masknet/theme'
import { useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'
import { Step, Stepper } from '../stepper'
import { LoadingCard } from './steps/LoadingCard'

export const RestoreFromCloud = memo(() => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const [backupId, setBackupId] = useState('')
    const [step, setStep] = useState<{ name: string; params: any }>({ name: 'validate', params: null })

    const [{ loading: fetchingBackupValue, error: fetchBackupValueError }, fetchBackupValueFn] = useAsyncFn(
        async (downloadLink) => fetchBackupValue(downloadLink),
        [],
    )

    const [{ loading: decryptingBackup, error: decryptError }, decryptBackupFn] = useAsyncFn(
        async (account: string, password: string, encryptedValue: string) => {
            return Services.Crypto.decryptBackup('password', 'account', encryptedValue)
        },
        [],
    )

    useEffect(() => {
        if (!fetchBackupValueError) return
        enqueueSnackbar('Download backup failed', { variant: 'error' })
    }, [fetchBackupValueError])

    useEffect(() => {
        if (!decryptError) return
        enqueueSnackbar('Decrypt failed, please check password', { variant: 'error' })
    }, [decryptError])

    const onValidated = async (downloadLink: string, account: string, password: string) => {
        try {
            const backupValue = await fetchBackupValueFn(downloadLink)
            const backupText = await decryptBackupFn(account, password, backupValue)
            const backupInfo = await Services.Welcome.parseBackupStr(backupText)

            if (backupInfo) {
                setBackupId(backupInfo.id)
                setStep({ name: 'restore', params: { backupJson: backupInfo.info } })
            }
            return null
        } catch (e) {
            enqueueSnackbar('Backup failed', { variant: 'error' })
            return 'Password is wrong'
        }
    }

    const onRestore = async () => {
        try {
            await Services.Welcome.checkPermissionsAndRestore(backupId)
            navigate(RoutePaths.Personas, { replace: true })
        } catch (e) {
            enqueueSnackbar('Backup failed', { variant: 'error' })
        }
    }

    const getTransition = useMemo(() => {
        if (decryptingBackup) {
            return {
                render: <LoadingCard text="Decrypting" />,
                trigger: decryptingBackup,
            }
        }
        if (fetchingBackupValue) {
            return {
                render: <LoadingCard text="Downloading" />,
                trigger: true,
            }
        }
        return undefined
    }, [fetchingBackupValue, decryptingBackup])

    return (
        <>
            <Stepper transition={getTransition} defaultStep="validate" step={step}>
                <Step name="validate">
                    {() => (
                        <Box sx={{ width: '100%' }}>
                            <CodeValidation onValidated={onValidated} />
                        </Box>
                    )}
                </Step>
                <Step name="restore">
                    {(_, { backupJson }) => (
                        <>
                            <Box sx={{ width: '100%' }}>
                                <BackupPreviewCard json={backupJson} />
                            </Box>
                            <ButtonGroup>
                                <Button variant="rounded" color="secondary" onClick={() => {}}>
                                    {t.cancel()}
                                </Button>
                                <Button variant="rounded" color="primary" onClick={onRestore}>
                                    {t.register_restore_backups_confirm()}
                                </Button>
                            </ButtonGroup>
                        </>
                    )}
                </Step>
            </Stepper>
            <Box sx={{ marginTop: '35px', width: '100%' }}>
                <MaskAlert description={t.sign_in_account_cloud_backup_warning()} />
            </Box>
        </>
    )
})
