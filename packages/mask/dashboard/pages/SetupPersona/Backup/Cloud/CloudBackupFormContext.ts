import { zodResolver } from '@hookform/resolvers/zod'
import { useLingui } from '@lingui/react/macro'
import { BackupAccountType } from '@masknet/shared-base'
import { createContainer } from '@masknet/shared-base-ui'
import guessCallingCode from 'guess-calling-code'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { phoneRegexp } from '../../../../utils/regexp.js'

export interface CloudBackupFormInputs {
    email: string
    phone: string
    code: string
    countryCode: string
}

export function useCloudBackupForm() {
    const { t } = useLingui()

    const [backupType, setBackupType] = useState<BackupAccountType>(BackupAccountType.Email)
    const isEmail = backupType === BackupAccountType.Email

    const form = useForm<CloudBackupFormInputs>({
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
                    email: isEmail ? z.string().email(t`Invalid email address format.`) : z.string().optional(),
                    countryCode: isEmail ? z.string().optional() : z.string(),
                    phone: isEmail ? z.string().optional() : z.string().regex(phoneRegexp),
                    code: z
                        .string()
                        .min(1, t`The code is incorrect.`)
                        .max(6, t`The code is incorrect.`),
                })
                .refine(
                    (data) => {
                        if (isEmail) return true
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
        form,
        backupType,
        setBackupType,
    }
}

export const CloudBackupFormContext = createContainer(useCloudBackupForm)
