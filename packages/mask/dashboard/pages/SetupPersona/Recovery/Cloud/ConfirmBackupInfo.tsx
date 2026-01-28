import Services from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import { Box } from '@mui/material'
import { memo, useCallback, useState, type ReactNode } from 'react'
import { OutletPortal } from '../../../../components/OutletPortal.js'
import PasswordField from '../../../../components/PasswordField/index.js'
import { PrimaryButton } from '../../../../components/PrimaryButton/index.js'
import { AccountStatusBar } from '../../../../components/Restore/AccountStatusBar.js'
import { BackupInfoCard } from '../../../../components/Restore/BackupInfoCard.js'
import { fetchBackupValue } from '../../../../utils/api.js'
import { RestoreContext } from './RestoreProvider.js'
import { RestoreStep } from './restoreReducer.js'

export const ConfirmBackupInfo = memo(function ConfirmBackupInfo() {
    const { t } = useLingui()
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState<ReactNode | undefined>(undefined)
    const { state, dispatch } = RestoreContext.useContainer()
    const { account, backupFileInfo, loading } = state

    const decrypt = useCallback(async (account: string, password: string, encryptedValue: ArrayBuffer) => {
        try {
            const decrypted = await decryptBackup(encode(account + password) as Uint8Array<ArrayBuffer>, encryptedValue)
            return JSON.stringify(decode(decrypted))
        } catch {
            return null
        }
    }, [])
    const handleNext = useCallback(async () => {
        if (!backupFileInfo) return
        dispatch({ type: 'SET_LOADING', loading: true })

        const backupEncrypted = await fetchBackupValue(backupFileInfo.downloadURL)
        const backupDecrypted = await decrypt(account, password, backupEncrypted)

        if (!backupDecrypted) {
            dispatch({ type: 'SET_LOADING', loading: false })
            return setErrorMessage(<Trans>Decrypt failed, please check password</Trans>)
        }

        const summary = await Services.Backup.generateBackupSummary(backupDecrypted)
        if (summary.isErr()) {
            dispatch({ type: 'SET_LOADING', loading: false })
            return setErrorMessage(<Trans>Decrypt failed, please check password</Trans>)
        }
        dispatch({ type: 'SET_LOADING', loading: false })

        dispatch({ type: 'SET_PASSWORD', password })
        dispatch({ type: 'TO_STEP', step: RestoreStep.Restore })
        dispatch({ type: 'SET_BACKUP_SUMMARY', summary: summary.value, backupDecrypted })
    }, [password, account, backupFileInfo])

    const handleSwitchAccount = useCallback(() => {
        dispatch({ type: 'TO_INPUT' })
    }, [])

    if (!backupFileInfo) return null

    return (
        <Box>
            <AccountStatusBar
                label={account}
                actionLabel={<Trans>Switch to other accounts</Trans>}
                onAction={handleSwitchAccount}
            />
            <Box mt={2}>
                <BackupInfoCard info={backupFileInfo} />
            </Box>
            <Box mt={4}>
                <PasswordField
                    fullWidth
                    placeholder={t`Backup password`}
                    onChange={(e) => {
                        setErrorMessage('')
                        setPassword(e.currentTarget.value)
                    }}
                    error={!!errorMessage}
                    helperText={errorMessage}
                />
            </Box>
            <OutletPortal>
                <PrimaryButton color="primary" size="large" onClick={handleNext} loading={loading}>
                    <Trans>Restore</Trans>
                </PrimaryButton>
            </OutletPortal>
        </Box>
    )
})
