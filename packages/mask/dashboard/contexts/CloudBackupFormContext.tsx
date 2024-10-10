import { createContainer } from '@masknet/shared-base-ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTabs } from '@masknet/theme'
import { emailRegexp, phoneRegexp } from '../utils/regexp.js'
import guessCallingCode from 'guess-calling-code'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export interface CloudBackupFormInputs {
    email: string
    phone: string
    code: string
    countryCode: string
}

function useCloudBackupFormContext() {
    const { _ } = useLingui()

    const [currentTab, onChange, tabs] = useTabs('email', 'mobile')

    const formState = useForm<CloudBackupFormInputs>({
        mode: 'onSubmit',
        context: {
            currentTab,
            tabs,
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
                        currentTab === tabs.email ?
                            z.string().refine((email) => emailRegexp.test(email), _(msg`Invalid email address format.`))
                        :   z.string().optional(),
                    countryCode: currentTab === tabs.mobile ? z.string() : z.string().optional(),
                    phone:
                        currentTab === tabs.mobile ?
                            z.string().refine((mobile) => phoneRegexp.test(mobile))
                        :   z.string().optional(),
                    code: z
                        .string()
                        .min(1, _(msg`The code is incorrect.`))
                        .max(6, _(msg`The code is incorrect.`)),
                })
                .refine(
                    (data) => {
                        if (currentTab !== tabs.mobile) return true
                        if (!data.countryCode || !data.phone) return false
                        return phoneRegexp.test(`+${data.countryCode} ${data.phone}`)
                    },
                    {
                        message: _(msg`The phone number is incorrect.`),
                        path: ['phone'],
                    },
                ),
        ),
    })

    return {
        formState,
        currentTab,
        onChange,
        tabs,
    }
}

export const CloudBackupFormContext = createContainer(useCloudBackupFormContext)
