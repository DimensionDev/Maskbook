import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAsync } from 'react-use'
import { z } from 'zod'
import { UserContext } from '../../shared-ui/index.js'
import Services from '#services'
import { passwordRegexp } from '../utils/regexp.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export type BackupFormInputs = {
    backupPassword: string
    paymentPassword?: string
}

export function useBackupFormState() {
    const { _ } = useLingui()
    const { value: hasPassword } = useAsync(Services.Wallet.hasPassword, [])
    const { value: previewInfo, loading } = useAsync(Services.Backup.generateBackupPreviewInfo, [])
    const { user } = UserContext.useContainer()
    const [backupWallets, setBackupWallets] = useState(false)

    const formState = useForm<BackupFormInputs>({
        mode: 'onBlur',
        context: {
            user,

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
                    .min(8, _(msg`Incorrect Password`))
                    .max(20, _(msg`Incorrect Password`))
                    .refine((password) => password === user.backupPassword, _(msg`Incorrect Password`))
                    .refine((password) => passwordRegexp.test(password), _(msg`Incorrect Password`)),
                paymentPassword:
                    backupWallets && hasPassword ?
                        z
                            .string({
                                required_error: _(msg`Incorrect Password`),
                            })
                            .min(6, _(msg`Incorrect Password`))
                            .max(20, _(msg`Incorrect Password`))
                    :   z.string().optional(),
            }),
        ),
    })

    return {
        hasPassword,
        previewInfo,
        loading,
        backupWallets,
        setBackupWallets,
        formState,
    }
}
