import { useDashboardI18N } from '../../../locales/index.js'
import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { sendCode } from '../../../pages/Settings/api.js'
import { useLanguage } from '../../../pages/Personas/api.js'
import { SendingCodeField, useCustomSnackbar } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { ButtonContainer } from '../../RegisterFrame/ButtonContainer.js'
import type { StepCommonProps } from '../../Stepper/index.js'
import { ValidationCodeStep } from './common.js'
import { type AccountType, type BackupFileInfo, Locale, Scenario } from '../../../pages/Settings/type.js'

interface ValidationAccountProps extends StepCommonProps {
    account: string
    type: AccountType
    onNext(
        account: string,
        type: AccountType,
        code: string,
    ): Promise<
        | BackupFileInfo
        | {
              message: string
          }
    >
}

export function ValidationAccount({ account, toStep, type, onNext }: ValidationAccountProps) {
    const language = useLanguage()
    const t = useDashboardI18N()
    const { showSnackbar } = useCustomSnackbar()

    const [code, setCode] = useState('')
    const [error, setError] = useState('')

    const [{ error: sendCodeError }, handleSendCodeFn] = useAsyncFn(async () => {
        showSnackbar(t.sign_in_account_cloud_backup_send_email_success({ type }), { variant: 'success' })
        await sendCode({
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
            toStep(ValidationCodeStep.ConfirmBackupInfo, { backupInfo, account, type })
        } else {
            setError(
                (
                    backupInfo as {
                        message: string
                    }
                ).message,
            )
        }
    }

    return (
        <>
            <SendingCodeField
                label={
                    <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bolder', fontSize: 12 }}
                        lineHeight="30px"
                        color="textPrimary">
                        {t.sign_in_account_cloud_send_verification_code_tip()} {account}
                    </Typography>
                }
                autoSend
                onChange={(c) => setCode(c)}
                errorMessage={sendCodeError?.message || error}
                onSend={handleSendCodeFn}
            />
            <ButtonContainer>
                <Button
                    size="large"
                    variant="rounded"
                    color="primary"
                    onClick={handleNext}
                    disabled={!account || !code}>
                    {t.next()}
                </Button>
            </ButtonContainer>
        </>
    )
}
