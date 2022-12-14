import { SmartPayAccount } from '@masknet/web3-providers'
import { ChainId } from '@masknet/web3-shared-evm'
import { compact } from 'lodash-es'
import { useAsync } from 'react-use'
import { createContainer } from 'unstated-next'
import { useQueryQualification } from '../hooks/useQueryQualification.js'

function useSmartPayContext() {
    const { value, loading } = useQueryQualification()

    const { value: accounts, loading: queryAccountsLoading } = useAsync(async () => {
        const owners = compact([
            ...(value?.signablePersonas?.map((x) => x.address) ?? []),
            ...(value?.signableWallets?.map((x) => x.address) ?? []),
        ])
        const accounts = await SmartPayAccount.getAccountsByOwners(ChainId.Mumbai, owners)

        return accounts.filter((x) => x.funded || x.deployed)
    }, [value])

    return {
        signablePersonas: value?.signablePersonas,
        signableWallets: value?.signableWallets,
        accounts,
        queryAccountsLoading,
        loading,
    }
}

export const SmartPayContext = createContainer(useSmartPayContext)
