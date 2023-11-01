import { useMemo } from 'react'
import { z as zod } from 'zod'
import { useMaskSharedTrans } from '../../../../../../shared-ui/index.js'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function defineSchema(refine: boolean, t: ReturnType<typeof useMaskSharedTrans>) {
    return zod
        .object({
            password: zod
                .string()
                .min(6, t.popups_wallet_password_length_error())
                .max(20, t.popups_wallet_password_length_error()),
            confirm: zod.string().optional(),
        })
        .refine((data) => !refine || data.password === data.confirm, {
            message: t.popups_wallet_password_not_match(),
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
    const t = useMaskSharedTrans()

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
