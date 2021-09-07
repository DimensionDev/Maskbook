import { useDashboardI18N } from '../../../locales'
import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { sendCode, useLanguage } from '../../../pages/Settings/api'
import { SendingCodeField } from '@masknet/theme'
import { Button, Typography } from '@material-ui/core'
import { ButtonContainer } from '../../RegisterFrame/ButtonContainer'
import type { StepCommonProps } from '../../Stepper'
import { ValidationCodeStep } from './common'
import { AccountType, BackupFileInfo, Scenario, Locale } from '../../../pages/Settings/type'

interface ValidationAccountProps extends StepCommonProps {
    account: string
    type: AccountType
    onNext(account: string, type: AccountType, code: string): Promise<BackupFileInfo | { message: string }>
}

export const ValidationAccount = ({ account, toStep, type, onNext }: ValidationAccountProps) => {
    const language = useLanguage()
    const t = useDashboardI18N()
    const [code, setCode] = useState('')
    const [error, setError] = useState('')

    const [{ error: sendCodeError }, handleSendCodeFn] = useAsyncFn(async () => {
        return sendCode({
            account,
            type,
            scenario: Scenario.backup,
            locale: language.includes('zh') ? Locale.zh : Locale.en,
        })
    }, [account, type])

    const handleNext = async () => {
        const backupInfo = await onNext(account, type, code)

        if ((backupInfo as BackupFileInfo).downloadURL) {
            setError('')
            toStep(ValidationCodeStep.ConfirmBackupInfo, { backupInfo: backupInfo, account: account })
        } else {
            setError((backupInfo as { message: string }).message)
        }
    }

    return (
        <>
            <SendingCodeField
                label={
                    <Typography variant="body2" sx={{ fontWeight: 'bolder' }} lineHeight="30px" color="textPrimary">
                        Send to {account}
                    </Typography>
                }
                onChange={(c) => setCode(c)}
                errorMessage={sendCodeError?.message || error}
                onSend={handleSendCodeFn}
            />
            <ButtonContainer>
                <Button variant="rounded" color="primary" onClick={handleNext} disabled={!account || !code}>
                    {t.next()}
                </Button>
            </ButtonContainer>
        </>
    )
}
