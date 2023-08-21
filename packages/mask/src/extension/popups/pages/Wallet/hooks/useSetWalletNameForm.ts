import { z as zod } from 'zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContacts, useWallets } from '@masknet/web3-hooks-base'
import { generateNewWalletName } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'

export function useSetWalletNameForm(defaultName?: string) {
    const { t } = useI18N()
    const wallets = useWallets()
    const contacts = useContacts()

    const schema = useMemo(() => {
        return zod.object({
            name: zod
                .string()
                .min(3, t('popups_wallet_settings_rename_tips'))
                .max(18, t('popups_wallet_settings_rename_tips'))
                .refine((name) => {
                    return name.trim().length !== 0
                }, t('wallet_name_length_error'))
                .refine((name) => {
                    return (
                        !wallets.some((wallet) => wallet.name === name) &&
                        !contacts.some((contact) => contact.name === name)
                    )
                }, t('account_already_exists')),
        })
    }, [wallets, t])

    const formValue = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            name: generateNewWalletName(wallets),
        },
    })

    return {
        ...formValue,
        schema,
    }
}
