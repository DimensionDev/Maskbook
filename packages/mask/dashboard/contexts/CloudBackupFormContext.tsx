import { createContainer } from 'unstated-next'
import { useDashboardI18N } from '../locales/i18n_generated.js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTabs } from '@masknet/theme'
import { phoneRegexp } from '../utils/regexp.js'

export interface CloudBackupFormInputs {
    email: string
    phone: string
    code: string
    countryCode: string
}

function useCloudBackupFormContext() {
    const t = useDashboardI18N()

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
            countryCode: '+93',
        },
        resolver: zodResolver(
            z
                .object({
                    email:
                        currentTab === tabs.email
                            ? z.string().email(t.cloud_backup_incorrect_email_address())
                            : z.string().optional(),
                    countryCode: currentTab === tabs.mobile ? z.string() : z.string().optional(),
                    phone:
                        currentTab === tabs.mobile
                            ? z.string().refine((mobile) => phoneRegexp.test(mobile))
                            : z.string().optional(),
                    code: z
                        .string()
                        .min(1, t.cloud_backup_incorrect_verified_code())
                        .max(6, t.cloud_backup_incorrect_verified_code()),
                })
                .refine(
                    (data) => {
                        if (currentTab !== tabs.mobile) return true
                        if (!data.countryCode || !data.phone) return false
                        return phoneRegexp.test(data.countryCode + data.phone)
                    },
                    {
                        message: t.settings_dialogs_incorrect_phone(),
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
