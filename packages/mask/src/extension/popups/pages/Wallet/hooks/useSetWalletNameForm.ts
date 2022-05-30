import { z as zod } from 'zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWallets } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const schema = zod.object({
    name: zod.string().min(1).max(12),
})
export function useSetWalletNameForm(
    defaultName?: string,
): UseFormReturn<{ name: string }, object> & { schema: typeof schema } {
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)

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
