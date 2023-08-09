import { z as zod } from 'zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWallets } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'

export function useSetWalletNameForm(defaultName?: string) {
    const { t } = useI18N()
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)

    const schema = useMemo(() => {
        return zod.object({
            name: zod
                .string()
                .min(1)
                .max(12)
                .refine((name) => {
                    return name.trim().length !== 0
                }, t('wallet_name_length_error'))
                .refine((name) => {
                    return !wallets.some((wallet) => wallet.name === name)
                }, t('account_already_exists')),
        })
    }, [wallets, t])

    const formValue = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            name: defaultName ?? `Wallet ${wallets.length + 1}`,
        },
    })

    return {
        ...formValue,
        schema,
    }
}
