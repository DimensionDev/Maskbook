import { useWallets } from '@masknet/web3-hooks-base'
import { createContainer } from 'unstated-next'
import { useQueryQualification } from '../hooks/useQueryQualification.js'

function useSmartPayContext() {
    const { value, loading } = useQueryQualification()
    const accounts = useWallets()

    return {
        signablePersonas: value?.signablePersonas,
        signableWallets: value?.signableWallets,
        accounts: accounts.filter((x) => x.owner),
        loading,
    }
}

export const SmartPayContext = createContainer(useSmartPayContext)
