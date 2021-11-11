import type { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { Services } from '../../../API'

export function useChainBalance(account: string, chainId: ChainId | null, providerType: ProviderType) {
    return useAsync(
        async () => (chainId ? Services.Ethereum.getBalance(account, { chainId }) : null),
        [account, chainId, providerType],
    )
}
