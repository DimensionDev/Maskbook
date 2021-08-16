import { useDashboardI18N } from '../../../locales'
import { useState, memo } from 'react'
import { Box, Button } from '@material-ui/core'
import { BackupInfoCard } from '../BackupInfoCard'
import { MaskTextField } from '@masknet/theme'
import { ButtonGroup } from '../../RegisterFrame/ButtonGroup'
import type { StepCommonProps } from '../../Stepper'
import { ValidationCodeStep } from './Commont'
import type { BackupFileInfo } from '../../../pages/Settings/type'

interface ConfirmBackupInfoProps extends StepCommonProps {
    backupInfo: BackupFileInfo
    account: string
    onNext(downloadLink: string, account: string, password: string): Promise<string | null>
}

export const ConfirmBackupInfo = memo(({ backupInfo, onNext, account, toStep }: ConfirmBackupInfoProps) => {
    const t = useDashboardI18N()
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleNext = async () => {
        const result = await onNext(backupInfo.downloadURL, account, password)
        if (result) {
            setErrorMessage(result)
        }
    }

    return backupInfo ? (
        <>
            <Box>
                <BackupInfoCard info={backupInfo} />
                <Box sx={{ mt: 4 }}>
                    <MaskTextField
                        label={t.sign_in_account_cloud_backup_password}
                        type="password"
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        error={!!errorMessage}
                        helperText={errorMessage}
                    />
                </Box>
            </Box>
            <ButtonGroup>
                <Button variant="rounded" color="secondary" onClick={() => toStep(ValidationCodeStep.EmailInput)}>
                    {t.cancel()}
                </Button>
                <Button variant="rounded" color="primary" onClick={handleNext}>
                    {t.next()}
                </Button>
            </ButtonGroup>
        </>
    ) : null
})
