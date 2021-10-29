import { useDashboardI18N } from '../../../locales'
import { memo, useState } from 'react'
import { Box, Button } from '@mui/material'
import { BackupInfoCard } from '../BackupInfoCard'
import { ButtonContainer } from '../../RegisterFrame/ButtonContainer'
import type { StepCommonProps } from '../../Stepper'
import type { BackupFileInfo } from '../../../pages/Settings/type'
import PasswordField from '../../PasswordField'

interface ConfirmBackupInfoProps extends StepCommonProps {
    backupInfo: BackupFileInfo
    onNext(password: string): Promise<string | null>
}

export const ConfirmBackupInfo = memo(({ backupInfo, onNext }: ConfirmBackupInfoProps) => {
    const t = useDashboardI18N()
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleNext = async () => {
        const result = await onNext(password)
        if (result) {
            setErrorMessage(result)
        }
    }

    if (!backupInfo) return null

    return (
        <>
            <Box>
                <BackupInfoCard info={backupInfo} />
                <Box sx={{ mt: 4 }}>
                    <PasswordField
                        label={t.sign_in_account_cloud_backup_password()}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        error={!!errorMessage}
                        helperText={errorMessage}
                    />
                </Box>
            </Box>
            <ButtonContainer>
                <Button variant="rounded" color="primary" onClick={handleNext}>
                    {t.restore()}
                </Button>
            </ButtonContainer>
        </>
    )
})
