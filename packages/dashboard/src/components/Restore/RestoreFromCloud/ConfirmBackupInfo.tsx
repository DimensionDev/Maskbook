import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import { Box } from '@mui/material'
import { memo, useCallback, useLayoutEffect, useState } from 'react'
import { Services } from '../../../API.js'
import { usePersonaRecovery } from '../../../contexts/index.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { fetchBackupValue } from '../../../pages/Settings/api.js'
import PasswordField from '../../PasswordField/index.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { AccountStatusBar } from '../AccountStatusBar.js'
import { BackupInfoCard } from '../BackupInfoCard.js'
import { RestoreContext } from './CloudRestoreProvider.js'
import { RestoreStep } from './restoreReducer.js'

export const ConfirmBackupInfo = memo(function ConfirmBackupInfo() {
    const t = useDashboardI18N()
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const { state, dispatch } = RestoreContext.useContainer()
    const { account, backupFileInfo, loading } = state

    const decrypt = useCallback(async (account: string, password: string, encryptedValue: ArrayBuffer) => {
        try {
            const decrypted = await decryptBackup(encode(account + password), encryptedValue)
            return JSON.stringify(decode(decrypted))
        } catch {
            return null
        } finally {
        }
    }, [])
    const handleNext = useCallback(async () => {
        if (!backupFileInfo) return
        dispatch({ type: 'SET_LOADING', loading: true })

        const backupEncrypted = await fetchBackupValue(backupFileInfo.downloadURL)
        const backupDecrypted = await decrypt(account, password, backupEncrypted)

        if (!backupDecrypted) {
            dispatch({ type: 'SET_LOADING', loading: false })
            return setErrorMessage(t.sign_in_account_cloud_backup_decrypt_failed())
        }

        const backupNormalized = await Services.Backup.addUnconfirmedBackup(backupDecrypted)
        if (backupNormalized.err) {
            dispatch({ type: 'SET_LOADING', loading: false })
            return setErrorMessage(t.sign_in_account_cloud_backup_decrypt_failed())
        }
        dispatch({ type: 'SET_LOADING', loading: false })

        const { info, id } = backupNormalized.val
        dispatch({ type: 'SET_PASSWORD', password })
        dispatch({ type: 'TO_STEP', step: RestoreStep.Restore })
        dispatch({ type: 'SET_BACKUP_SUMMARY', summary: info, id })
    }, [password, account, backupFileInfo])

    const handleSwitchAccount = useCallback(() => {
        dispatch({ type: 'TO_INPUT' })
    }, [])

    const { fillSubmitOutlet } = usePersonaRecovery()
    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton color="primary" size="large" onClick={handleNext} loading={loading}>
                {t.restore()}
            </PrimaryButton>,
        )
    }, [handleNext, t, loading])

    if (!backupFileInfo) return null

    return (
        <Box>
            <AccountStatusBar label={account} actionLabel={t.switch_other_accounts()} onAction={handleSwitchAccount} />
            <Box mt={2}>
                <BackupInfoCard info={backupFileInfo} />
            </Box>
            <Box mt={4}>
                <PasswordField
                    label={t.sign_in_account_cloud_backup_password()}
                    onChange={(e) => {
                        setErrorMessage('')
                        setPassword(e.currentTarget.value)
                    }}
                    error={!!errorMessage}
                    helperText={errorMessage}
                />
            </Box>
        </Box>
    )
})
