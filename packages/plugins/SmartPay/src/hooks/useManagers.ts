import { useMemo } from 'react'
import { useWallets } from '@masknet/web3-hooks-base'
import { useAllPersonas } from '@masknet/plugin-infra/content-script'

export function useManagers() {
    const wallets = useWallets()
    const personaManagers = useAllPersonas()
    const walletManagers = useMemo(() => wallets.filter((x) => !x.owner), [wallets])

    return {
        personaManagers,
        walletManagers,
    }
}
