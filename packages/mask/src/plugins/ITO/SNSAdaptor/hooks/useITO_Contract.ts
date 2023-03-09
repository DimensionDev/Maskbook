import type { AbiItem } from 'web3-utils'
import ITO_ABI from '@masknet/web3-contracts/abis/ITO.json'
import ITO2_ABI from '@masknet/web3-contracts/abis/ITO2.json'
import type { ITO } from '@masknet/web3-contracts/types/ITO.js'
import type { ITO2 } from '@masknet/web3-contracts/types/ITO2.js'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useITOConstants, type ChainId } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/web3-hooks-evm'

export function useITO_Contract(chainId?: ChainId, contractAddress?: string) {
    const { ITO_CONTRACT_ADDRESS, ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const ITO_CONTRACT = useContract<ITO>(chainId, ITO_CONTRACT_ADDRESS, ITO_ABI as AbiItem[])
    const ITO2_CONTRACT = useContract<ITO2>(chainId, ITO2_CONTRACT_ADDRESS, ITO2_ABI as AbiItem[])

    return contractAddress && isSameAddress(contractAddress, ITO_CONTRACT_ADDRESS)
        ? { contract: ITO_CONTRACT, version: 1 }
        : { contract: ITO2_CONTRACT, version: 2 }
}
