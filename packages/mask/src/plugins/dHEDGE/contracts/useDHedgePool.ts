import type { AbiItem } from 'web3-utils'
import DHedgePoolV1ABI from '@masknet/web3-contracts/abis/DHedgePoolV1.json'
import DHedgePoolV2ABI from '@masknet/web3-contracts/abis/DHedgePoolV2.json'
import DHedgePoolManagerABI from '@masknet/web3-contracts/abis/DHedgePoolManager.json'
import type { DHedgePoolV1 } from '@masknet/web3-contracts/types/DHedgePoolV1'
import type { DHedgePoolV2 } from '@masknet/web3-contracts/types/DHedgePoolV2'
import type { DHedgePoolManager } from '@masknet/web3-contracts/types/DHedgePoolManager'
import { useContract } from '@masknet/plugin-infra/src/entry-web3-evm'
import type { ChainId } from '@masknet/web3-shared-evm'

export function useDHedgePoolV1Contract(chainId: ChainId, address?: string) {
    return useContract<DHedgePoolV1>(chainId, address, DHedgePoolV1ABI as AbiItem[])
}

export function useDHedgePoolV2Contract(chainId: ChainId, address?: string) {
    return useContract<DHedgePoolV2>(chainId, address, DHedgePoolV2ABI as AbiItem[])
}

export function useDHedgePoolManagerContract(chainId: ChainId, address?: string) {
    return useContract<DHedgePoolManager>(chainId, address, DHedgePoolManagerABI as AbiItem[])
}
