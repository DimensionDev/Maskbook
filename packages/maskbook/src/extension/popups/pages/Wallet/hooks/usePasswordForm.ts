import { useMemo } from 'react'
import { z as zod } from 'zod'
import { useI18N } from '../../../../../utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function usePasswordForm() {
    const { t } = useI18N()

    const schema = useMemo(() => {
        return zod
            .object({
                password: zod
                    .string()
                    .min(8, t('popups_wallet_password_length_error'))
                    .max(20, t('popups_wallet_password_length_error'))
                    .refine(
                        (input) =>
                            [/[A-Z]/, /[a-z]/, /\d/, /[^\dA-Za-z]/].filter((regex) => regex.test(input)).length >= 2,
                        t('popups_wallet_password_satisfied_requirement'),
                    ),
                confirm: zod.string().min(8).max(20),
            })
            .refine((data) => data.password === data.confirm, {
                message: t('popups_wallet_password_dont_match'),
                path: ['confirm'],
            })
    }, [])

    const formValue = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            password: '',
            confirm: '',
        },
    })

    return { ...formValue, schema }
}
