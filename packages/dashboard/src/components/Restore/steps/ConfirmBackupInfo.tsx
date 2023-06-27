import { useDashboardI18N } from '../../../locales/index.js'
import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { BackupInfoCard } from '../BackupInfoCard.js'
import type { StepCommonProps } from '../../Stepper/index.js'
import type { BackupFileInfo } from '../../../pages/Settings/type.js'
import PasswordField from '../../PasswordField/index.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { usePersonaRecovery } from '../../../contexts/index.js'
import { AccountStatusBar } from '../AccountStatusBar.js'

interface ConfirmBackupInfoProps extends StepCommonProps {
    account: string
    backupInfo: BackupFileInfo
    onNext(password: string): Promise<string | null>
    onSwitch(): void
}

export const ConfirmBackupInfo = memo(function ConfirmBackupInfo({
    account,
    backupInfo,
    onSwitch,
    onNext,
}: ConfirmBackupInfoProps) {
    const t = useDashboardI18N()
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const nextRef = useRef<ConfirmBackupInfoProps['onNext']>(onNext)
    nextRef.current = onNext

    const handleNext = useCallback(async () => {
        const result = await nextRef.current?.(password)
        if (result) {
            setErrorMessage(result)
        }
    }, [password])

    const { fillSubmitOutlet } = usePersonaRecovery()
    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton color="primary" size="large" onClick={handleNext}>
                {t.restore()}
            </PrimaryButton>,
        )
    }, [handleNext, t])

    if (!backupInfo) return null

    return (
        <Box>
            <AccountStatusBar label={account} actionLabel={t.switch_other_accounts()} onAction={onSwitch} />
            <Box mt={2}>
                <BackupInfoCard info={backupInfo} />
            </Box>
            <Box mt={4}>
                <PasswordField
                    label={t.sign_in_account_cloud_backup_password()}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    error={!!errorMessage}
                    helperText={errorMessage}
                />
            </Box>
        </Box>
    )
})
