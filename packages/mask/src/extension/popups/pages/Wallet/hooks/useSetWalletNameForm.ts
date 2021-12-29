import { z as zod } from 'zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWallets } from '@masknet/web3-shared-evm'

const schema = zod.object({
    name: zod.string().min(1).max(12),
})
export function useSetWalletNameForm(
    defaultName?: string,
): UseFormReturn<{ name: string }, object> & { schema: typeof schema } {
    const wallets = useWallets()

    const formValue = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            name: defaultName ?? `account ${wallets.length + 1}`,
        },
    })

    return {
        ...formValue,
        schema,
    }
}
