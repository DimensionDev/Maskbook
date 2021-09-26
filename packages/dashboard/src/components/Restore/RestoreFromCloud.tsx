import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useDashboardI18N } from '../../locales'
import { Box } from '@material-ui/core'
import { MaskAlert } from '../MaskAlert'
import { CodeValidation } from './CodeValidation'
import { fetchBackupValue } from '../../pages/Settings/api'
import { PluginServices, Services } from '../../API'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer'
import { useSnackbar } from '@masknet/theme'
import { useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../type'
import { Step, Stepper } from '../Stepper'
import { LoadingCard } from './steps/LoadingCard'
import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext'
import { AccountType } from '../../pages/Settings/type'
import { UserContext } from '../../pages/Settings/hooks/UserContext'
import { ConfirmSynchronizePasswordDialog } from './ConfirmSynchronizePasswordDialog'
import { LoadingButton } from '../LoadingButton'
import type { BackupPreview } from '../../../../maskbook/src/utils'

export const RestoreFromCloud = memo(() => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const { user, updateUser } = useContext(UserContext)
    const { currentPersona, changeCurrentPersona } = PersonaContext.useContainer()

    const [account, setAccount] = useState<null | { type: AccountType; value: string; password: string }>(null)
    const [backupId, setBackupId] = useState('')
    const [openSynchronizePasswordDialog, toggleSynchronizePasswordDialog] = useState(false)
    const [step, setStep] = useState<{ name: string; params: any }>({ name: 'validate', params: null })

    const [{ loading: fetchingBackupValue, error: fetchBackupValueError }, fetchBackupValueFn] = useAsyncFn(
        async (downloadLink) => fetchBackupValue(downloadLink),
        [],
    )

    const [{ loading: decryptingBackup }, decryptBackupFn] = useAsyncFn(
        async (account: string, password: string, encryptedValue: ArrayBuffer) => {
            try {
                const decrypted = await decryptBackup(encode(account + password), encryptedValue)
                return JSON.stringify(decode(decrypted))
            } catch {
                return null
            }
        },
        [],
    )

    useEffect(() => {
        if (!fetchBackupValueError) return
        enqueueSnackbar(t.sign_in_account_cloud_backup_download_failed(), { variant: 'error' })
    }, [fetchBackupValueError])

    const onValidated = useCallback(
        async (downloadLink: string, accountValue: string, password: string, type: AccountType) => {
            const backupValue = await fetchBackupValueFn(downloadLink)
            const backupText = await decryptBackupFn(accountValue, password, backupValue)

            if (!backupText) {
                return t.sign_in_account_cloud_backup_decrypt_failed()
            }

            const backupInfo = await Services.Welcome.parseBackupStr(backupText)
            if (backupInfo) {
                setBackupId(backupInfo.id)
                setAccount({ type, value: accountValue, password })
                setStep({
                    name: 'restore',
                    params: {
                        backupJson: backupInfo.info,
                        handleRestore: () => onRestore(backupInfo, { type, value: accountValue, password }),
                    },
                })
                return null
            }
            return t.sign_in_account_cloud_backup_decrypt_failed()
        },
        [],
    )

    const onRestore = useCallback(
        async (backupInfo: { info: BackupPreview; id: string }, account: any) => {
            try {
                if (
                    backupInfo.info?.wallets &&
                    (!(await PluginServices.Wallet.hasPassword()) || (await PluginServices.Wallet.isLocked()))
                ) {
                    await Services.Helper.openPopupsWindow('/wallet/recovered', { backupId: backupInfo.id })
                    return
                }

                await Services.Welcome.checkPermissionsAndRestore(backupInfo.id)

                if (!currentPersona) {
                    const lastedPersona = await Services.Identity.queryLastPersonaCreated()
                    if (lastedPersona) {
                        await changeCurrentPersona(lastedPersona.identifier)
                    }
                }
                if (account) {
                    if (!user.email && account.type === AccountType.email) {
                        updateUser({ email: account.value })
                    }
                    if (!user.phone && account.type === AccountType.phone) {
                        updateUser({ phone: account.value })
                    }
                }
                toggleSynchronizePasswordDialog(true)
            } catch {
                enqueueSnackbar(t.sign_in_account_cloud_restore_failed(), { variant: 'error' })
            }
        },
        [user],
    )

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

    const synchronizePassword = () => {
        if (!account) return
        updateUser({ backupPassword: account.password })
        onCloseSynchronizePassword()
    }

    const onCloseSynchronizePassword = () => {
        toggleSynchronizePasswordDialog(false)
        navigate(RoutePaths.Personas, { replace: true })
    }

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
                    {(_, { backupJson: backupBasicInfoJson, handleRestore: handleRestore }) => (
                        <>
                            <Box sx={{ width: '100%' }}>
                                <BackupPreviewCard json={backupBasicInfoJson} />
                            </Box>
                            <ButtonContainer>
                                <LoadingButton variant="rounded" color="primary" onClick={handleRestore}>
                                    {t.restore()}
                                </LoadingButton>
                            </ButtonContainer>
                        </>
                    )}
                </Step>
            </Stepper>
            {openSynchronizePasswordDialog && (
                <ConfirmSynchronizePasswordDialog
                    open={openSynchronizePasswordDialog}
                    onClose={() => onCloseSynchronizePassword()}
                    onConform={synchronizePassword}
                />
            )}
            <Box sx={{ pt: 4, pb: 2, width: '100%' }}>
                <MaskAlert description={t.sign_in_account_cloud_backup_warning()} />
            </Box>
        </>
    )
})
