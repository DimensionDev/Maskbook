import { useMemo } from 'react'
import { z as zod } from 'zod'
import { useI18N, I18NFunction } from '../../../../../utils'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function defineSchema(refine: boolean, t: I18NFunction) {
    return zod
        .object({
            password: zod
                .string()
                .min(8, t('popups_wallet_password_length_error'))
                .max(20, t('popups_wallet_password_length_error'))
                .refine(
                    (input) => [/[A-Z]/, /[a-z]/, /\d/, /[^\dA-Za-z]/].filter((regex) => regex.test(input)).length >= 2,
                    t('popups_wallet_password_satisfied_requirement'),
                ),
            confirm: zod.string().optional(),
        })
        .refine((data) => !refine || data.password === data.confirm, {
            message: t('popups_wallet_password_dont_match'),
            path: ['confirm'],
        })
}
export function usePasswordForm(refine = true): UseFormReturn<
    {
        confirm?: string | undefined
        password: string
    },
    object
> & { schema: ReturnType<typeof defineSchema> } {
    const { t } = useI18N()

    const schema = useMemo(() => {
        return defineSchema(refine, t)
    }, [refine, t])

    const formValue = useForm<zod.infer<typeof schema>>({
        mode: 'onBlur',
        resolver: zodResolver(schema),
        defaultValues: {
            password: '',
            confirm: '',
        },
    })

    return { ...formValue, schema }
}
