import { useMemo } from 'react'
import { z as zod } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWallet } from '@masknet/web3-shared'

export function useSetWalletNameForm() {
    const wallet = useWallet()
    const schema = useMemo(() => {
        return zod.object({
            name: zod.string().min(1).max(12),
        })
    }, [])

    const formValue = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            name: wallet?.name,
        },
    })

    return {
        ...formValue,
        schema,
    }
}
