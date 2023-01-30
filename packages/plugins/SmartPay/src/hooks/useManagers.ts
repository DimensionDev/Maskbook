import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { PersonaInformation } from '@masknet/shared-base'
import { useWallets } from '@masknet/web3-hooks-base'
import { Wallet } from '@masknet/web3-shared-base'
import { useMemo } from 'react'

export function useManagers(): { personaManagers: PersonaInformation[]; walletManagers: Wallet[] } {
    const wallets = useWallets()
    const personaManagers = useAllPersonas()
    const walletManagers = useMemo(() => wallets.filter((x) => !x.owner), [wallets])

    return {
        personaManagers,
        walletManagers,
    }
}
