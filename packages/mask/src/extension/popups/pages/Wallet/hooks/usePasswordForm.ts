import { useMemo } from 'react'
import { z as zod } from 'zod'
import { useI18N, type I18NFunction } from '../../../../../utils/index.js'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function defineSchema(refine: boolean, t: I18NFunction) {
    return zod
        .object({
            password: zod
                .string()
                .min(8, t('popups_wallet_password_length_error'))
                .max(20, t('popups_wallet_password_length_error')),
            confirm: zod.string().optional(),
        })
        .refine((data) => !refine || data.password === data.confirm, {
            message: t('popups_wallet_password_not_match'),
            path: ['confirm'],
        })
}
export function usePasswordForm(refine = true): UseFormReturn<
    {
        confirm?: string | undefined
        password: string
    },
    object
> & {
    schema: ReturnType<typeof defineSchema>
} {
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
