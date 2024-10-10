import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import { Box } from '@mui/material'
import { memo, useCallback, useLayoutEffect, useState, type ReactNode } from 'react'
import Services from '#services'
import { usePersonaRecovery } from '../../../contexts/index.js'
import { useDashboardTrans } from '../../../locales/index.js'
import { fetchBackupValue } from '../../../utils/api.js'
import PasswordField from '../../PasswordField/index.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { AccountStatusBar } from '../AccountStatusBar.js'
import { BackupInfoCard } from '../BackupInfoCard.js'
import { RestoreContext } from './RestoreProvider.js'
import { RestoreStep } from './restoreReducer.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const ConfirmBackupInfo = memo(function ConfirmBackupInfo() {
    const { _ } = useLingui()
    const t = useDashboardTrans()
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState<ReactNode | undefined>(undefined)
    const { state, dispatch } = RestoreContext.useContainer()
    const { account, backupFileInfo, loading } = state

    const decrypt = useCallback(async (account: string, password: string, encryptedValue: ArrayBuffer) => {
        try {
            const decrypted = await decryptBackup(encode(account + password), encryptedValue)
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

    const { fillSubmitOutlet } = usePersonaRecovery()
    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton color="primary" size="large" onClick={handleNext} loading={loading}>
                <Trans>Restore</Trans>
            </PrimaryButton>,
        )
    }, [handleNext, t, loading])

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
                    placeholder={_(msg`Backup password`)}
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
