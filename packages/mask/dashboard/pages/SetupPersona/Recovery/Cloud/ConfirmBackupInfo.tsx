import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import { Box, Portal } from '@mui/material'
import { memo, useCallback, useState, type ReactNode } from 'react'
import Services from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { useOutletContext } from 'react-router-dom'
import type { PortalContainerProps } from '../../types.js'
import { fetchBackupValue } from '../../../../utils/api.js'
import PasswordField from '../../../../components/PasswordField/index.js'
import { RestoreContext } from '../../../../components/Restore/RestoreFromCloud/RestoreProvider.js'
import { RestoreStep } from '../../../../components/Restore/RestoreFromCloud/restoreReducer.js'
import { AccountStatusBar } from '../../../../components/Restore/AccountStatusBar.js'
import { BackupInfoCard } from '../../../../components/Restore/BackupInfoCard.js'
import { PrimaryButton } from '../../../../components/PrimaryButton/index.js'

export const ConfirmBackupInfo = memo(function ConfirmBackupInfo() {
    const { t } = useLingui()
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

    const { portalContainerRef } = useOutletContext<PortalContainerProps>()

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
            <Portal container={() => portalContainerRef.current}>
                <PrimaryButton color="primary" size="large" onClick={handleNext} loading={loading}>
                    <Trans>Restore</Trans>
                </PrimaryButton>
            </Portal>
        </Box>
    )
})
