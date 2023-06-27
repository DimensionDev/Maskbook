import { SendingCodeField, useCustomSnackbar } from '@masknet/theme'
import { Button } from '@mui/material'
import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useDashboardI18N } from '../../../locales/index.js'
import { useLanguage } from '../../../pages/Personas/api.js'
import { sendCode } from '../../../pages/Settings/api.js'
import { Locale, Scenario, type AccountType, type BackupFileInfo } from '../../../pages/Settings/type.js'
import { ButtonContainer } from '../../RegisterFrame/ButtonContainer.js'
import type { StepCommonProps } from '../../Stepper/index.js'
import { ValidationCodeStep } from './common.js'

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

/**
 * @deprecated Unused
 */
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

        if ('downloadURL' in backupInfo) {
            setError('')
            toStep(ValidationCodeStep.ConfirmBackupInfo, { backupInfo, account, type })
        } else {
            setError(backupInfo.message)
        }
    }

    return (
        <>
            <SendingCodeField
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
