import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAsync } from 'react-use'
import { z } from 'zod'
import { UserContext } from '../../shared-ui/index.js'
import Services from '#services'
import { passwordRegexp } from '../utils/regexp.js'
import { useDashboardI18N } from '../locales/i18n_generated.js'

export type BackupFormInputs = {
    backupPassword: string
    paymentPassword?: string
}

export function useBackupFormState() {
    const t = useDashboardI18N()
    const { value: hasPassword } = useAsync(Services.Wallet.hasPassword, [])
    const { value: previewInfo, loading } = useAsync(Services.Backup.generateBackupPreviewInfo, [])
    const { user } = UserContext.useContainer()
    const [backupPersonas, setBackupPersonas] = useState(true)
    const [backupWallets, setBackupWallets] = useState(false)

    const formState = useForm<BackupFormInputs>({
        mode: 'onBlur',
        context: {
            user,
            backupPersonas,
            backupWallets,
            hasPassword,
        },
        defaultValues: {
            backupPassword: '',
            paymentPassword: '',
        },
        resolver: zodResolver(
            z.object({
                backupPassword: z
                    .string()
                    .min(8, t.incorrect_password())
                    .max(20, t.incorrect_password())
                    .refine((password) => password === user.backupPassword, t.incorrect_password())
                    .refine((password) => passwordRegexp.test(password), t.incorrect_password()),
                paymentPassword:
                    backupWallets && hasPassword
                        ? z
                              .string({
                                  required_error: t.incorrect_password(),
                              })
                              .min(6, t.incorrect_password())
                              .max(20, t.incorrect_password())
                        : z.string().optional(),
            }),
        ),
    })

    return {
        hasPassword,
        previewInfo,
        loading,
        backupPersonas,
        backupWallets,
        setBackupPersonas,
        setBackupWallets,
        formState,
    }
}
