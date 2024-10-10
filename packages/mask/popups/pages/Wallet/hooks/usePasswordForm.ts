import { useMemo } from 'react'
import { z as zod } from 'zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { msg } from '@lingui/macro'
import { useLingui, type I18nContext } from '@lingui/react'

function defineSchema(refine: boolean, _: I18nContext['_']) {
    return zod
        .object({
            password: zod
                .string()
                .min(6, _(msg`Payment password must be 6 to 20 characters.`))
                .max(20, _(msg`Payment password must be 6 to 20 characters.`)),
            confirm: zod.string().optional(),
        })
        .refine((data) => !refine || data.password === data.confirm, {
            message: _(msg`Two entered passwords are not the same.`),
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
    const { _ } = useLingui()

    const schema = useMemo(() => {
        return defineSchema(refine, _)
    }, [refine, _])

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
