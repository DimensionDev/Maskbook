import { type AccountType } from '../../../pages/Settings/type.js'

interface LabelProps {
    onModeChange(mode: AccountType): void
    mode: AccountType
}

export enum ValidationCodeStep {
    EmailInput = 'EmailInput',
    PhoneInput = 'PhoneInput',
    AccountValidation = 'AccountValidation',
    ConfirmBackupInfo = 'ConfirmBackupInfo',
}
