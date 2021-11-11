import { NetworkType, ProviderType, getChainIdFromNetworkType, ChainId } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { Services } from '../../../API'

export function useChainBalanceList(account: string, providerType: ProviderType) {
    const chainIdList = Object.keys(NetworkType).map((x) => getChainIdFromNetworkType(x as NetworkType))
    const allRequest = chainIdList.map(async (chainId) => ({
        balance: await Services.Ethereum.getBalance(account, { chainId }),
        chainId,
    }))
    return useAsync(async () => {
        const balanceList = (await Promise.allSettled(allRequest))
            .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
            .filter((value) => value) as { balance: string; chainId: ChainId }[]
        return balanceList
    }, [account, providerType])
}
