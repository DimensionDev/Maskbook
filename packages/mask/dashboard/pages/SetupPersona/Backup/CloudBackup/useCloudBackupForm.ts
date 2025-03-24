import { zodResolver } from '@hookform/resolvers/zod'
import { useLingui } from '@lingui/react/macro'
import { BackupAccountType } from '@masknet/shared-base'
import guessCallingCode from 'guess-calling-code'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { emailRegexp, phoneRegexp } from '../../../../utils/regexp.js'

export interface CloudBackupFormInputs {
    email: string
    phone: string
    code: string
    countryCode: string
}

export function useCloudBackupForm(backupType: BackupAccountType) {
    const { t } = useLingui()

    const formState = useForm<CloudBackupFormInputs>({
        mode: 'onSubmit',
        context: {
            backupType,
        },
        defaultValues: {
            email: '',
            phone: '',
            code: '',
            countryCode: (guessCallingCode.default || guessCallingCode)(),
        },
        resolver: zodResolver(
            z
                .object({
                    email:
                        backupType === BackupAccountType.Email ?
                            z.string().regex(emailRegexp, t`Invalid email address format.`)
                        :   z.string().optional(),
                    countryCode: backupType === BackupAccountType.Phone ? z.string() : z.string().optional(),
                    phone:
                        backupType === BackupAccountType.Phone ? z.string().regex(phoneRegexp) : z.string().optional(),
                    code: z
                        .string()
                        .min(1, t`The code is incorrect.`)
                        .max(6, t`The code is incorrect.`),
                })
                .refine(
                    (data) => {
                        if (backupType !== BackupAccountType.Phone) return true
                        if (!data.countryCode || !data.phone) return false
                        return phoneRegexp.test(`+${data.countryCode} ${data.phone}`)
                    },
                    {
                        message: t`The phone number is incorrect.`,
                        path: ['phone'],
                    },
                ),
        ),
    })

    return {
        formState,
    }
}
