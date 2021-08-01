import { useDashboardI18N } from '../../../locales'
import { useState } from 'react'
import { Box, Button } from '@material-ui/core'
import { BackupInfoCard } from '../BackupInfoCard'
import { MaskTextField } from '@masknet/theme'
import { ButtonGroup } from '../../RegisterFrame/ButtonGroup'
import type { CommonProps } from '../../stepper'
import { ValidationCodeStep } from './Commont'

interface ConfirmBackupInfoProps extends CommonProps {
    backupInfo: any
    account: string
    onNext(downloadLink: string, account: string, password: string): Promise<string>
}

export const ConfirmBackupInfo = ({ backupInfo, onNext, account, toStep }: ConfirmBackupInfoProps) => {
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
                        label="Backup Password"
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
}
