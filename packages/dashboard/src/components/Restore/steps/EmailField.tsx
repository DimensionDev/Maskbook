import { useDashboardI18N } from '../../../locales/index.js'
import { memo, useLayoutEffect, useState } from 'react'
import { MaskTextField } from '@masknet/theme'
import { Label, ValidationCodeStep } from './common.js'
import type { StepCommonProps } from '../../Stepper/index.js'
import { AccountType } from '../../../pages/Settings/type.js'
import { emailRegexp } from '../../../pages/Settings/regexp.js'
import { usePersonaRecovery } from '../../../contexts/RecoveryContext.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'

export const EmailField = memo(function EmailField({ toStep }: StepCommonProps) {
    const t = useDashboardI18N()
    const [account, setAccount] = useState<string>('')
    const [invalidEmail, setInvalidEmail] = useState(false)

    const { fillSubmitOutlet } = usePersonaRecovery()

    const validCheck = () => {
        if (!account) return

        const isValid = emailRegexp.test(account)
        setInvalidEmail(!isValid)
    }

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                color="primary"
                size="large"
                onClick={() => toStep(ValidationCodeStep.AccountValidation, { account, type: AccountType.email })}
                disabled={!account || invalidEmail}>
                {t.next()}
            </PrimaryButton>,
        )
    }, [!account, invalidEmail])

    /* <ButtonContainer> */
    /*     <Button */
    /*         variant="rounded" */
    /*         color="primary" */
    /*         size="large" */
    /*         onClick={() => toStep(ValidationCodeStep.AccountValidation, { account, type: AccountType.email })} */
    /*         disabled={!account || invalidEmail}> */
    /*         {t.next()} */
    /*     </Button> */
    /* </ButtonContainer> */

    return (
        <MaskTextField
            label={<Label onModeChange={() => toStep(ValidationCodeStep.PhoneInput)} mode={AccountType.email} />}
            fullWidth
            value={account}
            onBlur={validCheck}
            onChange={(event) => setAccount(event.target.value)}
            error={invalidEmail}
            helperText={invalidEmail ? t.sign_in_account_cloud_backup_email_format_error() : ''}
            type="email"
        />
    )
})
