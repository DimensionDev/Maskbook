import { memo } from 'react'
import { fetchDownloadLink } from '../../pages/Settings/api'
import { useAsyncFn } from 'react-use'
import { Step, Stepper } from '../stepper'
import { ConfirmBackupInfo } from './steps/ConfirmBackupInfo'
import { EmailField } from './steps/EmailField'
import { PhoneField } from './steps/PhoneField'
import { BackupInfoLoading } from './steps/BackupInfoLoading'
import { ValidationAccount } from './steps/ValidationAccount'
import { ValidationCodeStep } from './steps/Commont'

interface CodeValidationProps {
    onValidated(downloadLink: string, account: string, password: string): Promise<string>
}

export const CodeValidation = memo(({ onValidated }: CodeValidationProps) => {
    const [{ loading: fetchingBackupInfo, error: fetchBackupInfoError, value: backupInfo }, fetchDownloadLinkFn] =
        useAsyncFn(async (account: string, type: AccountValidationType, code: string) => {
            return fetchDownloadLink({ code, account, type })
        }, [])

    const getCurrentStepContext = () => {
        if (fetchingBackupInfo) return { step: ValidationCodeStep.BackupInfoLoading }
        if (fetchBackupInfoError) return { step: ValidationCodeStep.AccountValidation }

        return undefined
    }

    return (
        <Stepper default={ValidationCodeStep.EmailInput} stepContext={getCurrentStepContext()}>
            <Step name={ValidationCodeStep.EmailInput}>{(toStep) => <EmailField toStep={toStep} />}</Step>
            <Step name={ValidationCodeStep.PhoneInput}>{(toStep) => <PhoneField toStep={toStep} />}</Step>
            <Step name={ValidationCodeStep.AccountValidation}>
                {(toStep, { account, type }) => (
                    <ValidationAccount toStep={toStep} account={account} type={type} onNext={fetchDownloadLinkFn} />
                )}
            </Step>
            <Step name={ValidationCodeStep.BackupInfoLoading}>{() => <BackupInfoLoading />}</Step>
            <Step name={ValidationCodeStep.ConfirmBackupInfo}>
                {(toStep, { backupInfo, account }) => (
                    <ConfirmBackupInfo toStep={toStep} backupInfo={backupInfo} account={account} onNext={onValidated} />
                )}
            </Step>
        </Stepper>
    )
})
