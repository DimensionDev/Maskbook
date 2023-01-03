import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { useWallets } from '@masknet/web3-hooks-base'
import { useMemo } from 'react'

export function useManagers() {
    const wallets = useWallets()
    const personaManagers = useAllPersonas()
    const walletManagers = useMemo(() => wallets.filter((x) => !x.owner), [wallets])

    return {
        personaManagers,
        walletManagers,
    }
}
