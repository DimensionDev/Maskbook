import type { AbiItem } from 'web3-utils'
import IdeaMarketLockProxyABI from '@masknet/web3-contracts/abis/IdeaMarketLockProxy.json'
import type { IdeaMarketLockProxy } from '@masknet/web3-contracts/types/IdeaMarketLockProxy'
import { useContract } from '@masknet/web3-shared-evm'

export function useLockProxyContract(address?: string) {
    return useContract<IdeaMarketLockProxy>(address, IdeaMarketLockProxyABI as AbiItem[])
}
