import { memo, useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import { Box, Card } from '@material-ui/core'
import type { BackupPreview } from '@masknet/public-api'
import { useSnackbar } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { PluginServices, Services } from '../../API'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'
import { MaskAlert } from '../MaskAlert'
import FileUpload from '../FileUpload'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../type'
import { blobToText } from '@dimensiondev/kit'
import { LoadingCard } from './steps/LoadingCard'
import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext'
import { LoadingButton } from '../LoadingButton'
import PasswordField from '../PasswordField'
import { first } from 'lodash-es'
import { ProviderType } from '@masknet/web3-shared'

enum RestoreStatus {
    WaitingInput = 0,
    Verifying = 1,
    Verified = 2,
    Decrypting = 3,
}

export const RestoreFromLocal = memo(() => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const { currentPersona, changeCurrentPersona } = PersonaContext.useContainer()

    const [file, setFile] = useState<File | null>(null)
    const [json, setJSON] = useState<BackupPreview | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [backupId, setBackupId] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.WaitingInput)

    const handleSetFile = useCallback(async (file: File) => {
        setFile(file)
        if (file.type === 'application/json') {
            const content = await blobToText(file)
            setBackupValue(content)
        } else if (['application/octet-stream', 'application/macbinary'].includes(file.type)) {
            setRestoreStatus(RestoreStatus.Decrypting)
        } else {
            enqueueSnackbar(t.sign_in_account_cloud_backup_not_support(), { variant: 'error' })
        }
    }, [])

    useAsync(async () => {
        if (!backupValue) return

        setRestoreStatus(RestoreStatus.Verifying)
        try {
            const backupInfo = await Services.Welcome.parseBackupStr(backupValue)

            if (backupInfo) {
                setJSON(backupInfo.info)
                setBackupId(backupInfo.id)
                setRestoreStatus(RestoreStatus.Verified)
            } else {
                setRestoreStatus(RestoreStatus.WaitingInput)
                setBackupValue('')
            }
        } catch {
            enqueueSnackbar(t.sign_in_account_cloud_backup_not_support(), { variant: 'error' })
            setRestoreStatus(RestoreStatus.WaitingInput)
            setBackupValue('')
        }
    }, [backupValue])

    const decryptBackupFile = useCallback(async () => {
        if (!file) return

        try {
            const decrypted = await decryptBackup(encode(password), await file.arrayBuffer())
            setBackupValue(JSON.stringify(decode(decrypted)))
        } catch (error_) {
            setError(t.sign_in_account_cloud_backup_decrypt_failed())
        }
    }, [file, password])

    const restoreDB = useCallback(async () => {
        try {
            if (
                json?.wallets &&
                (!(await PluginServices.Wallet.hasPassword()) || (await PluginServices.Wallet.isLocked()))
            ) {
                await Services.Helper.openPopupsWindow('/wallet/recovered', { backupId })
                return
            }

            await Services.Welcome.checkPermissionsAndRestore(backupId)

            // If user don't have a wallet
            if (json?.wallets && !(await Services.Settings.getSelectedWalletAddress())) {
                const wallets = await PluginServices.Wallet.getWallets()
                const address = first(wallets)?.address
                if (address) {
                    await PluginServices.Wallet.updateAccount({
                        account: address,
                        providerType: ProviderType.MaskWallet,
                    })
                }
            }

            if (!currentPersona) {
                const lastedPersona = await Services.Identity.queryLastPersonaCreated()
                if (lastedPersona) {
                    await changeCurrentPersona(lastedPersona.identifier)
                }
            }
            navigate(RoutePaths.Personas, { replace: true })
        } catch {
            enqueueSnackbar(t.sign_in_account_cloud_backup_failed(), { variant: 'error' })
        }
    }, [backupId, json])

    return (
        <>
            <Box sx={{ width: '100%' }}>
                {restoreStatus === RestoreStatus.Verifying && <LoadingCard text="Verifying" />}
                {restoreStatus === RestoreStatus.WaitingInput && (
                    <Card variant="background" sx={{ height: '144px' }}>
                        <FileUpload onChange={handleSetFile} accept="application/octet-stream, application/json" />
                    </Card>
                )}
                {restoreStatus === RestoreStatus.Verified && json && <BackupPreviewCard json={json} />}
                {restoreStatus === RestoreStatus.Decrypting && (
                    <Box sx={{ mt: 4 }}>
                        <PasswordField
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
                <LoadingButton
                    variant="rounded"
                    size="large"
                    color="primary"
                    onClick={restoreStatus === RestoreStatus.Decrypting ? decryptBackupFile : restoreDB}
                    disabled={restoreStatus === RestoreStatus.Verified ? !json : !file}>
                    {restoreStatus !== RestoreStatus.Verified ? t.next() : t.restore()}
                </LoadingButton>
            </ButtonContainer>
            <Box sx={{ pt: 4, pb: 2, width: '100%' }}>
                <MaskAlert description={t.sign_in_account_local_backup_warning()} />
            </Box>
        </>
    )
})
