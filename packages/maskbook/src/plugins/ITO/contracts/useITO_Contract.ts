import type { AbiItem } from 'web3-utils'
import ITO_ABI from '@masknet/contracts/abis/ITO.json'
import ITO2_ABI from '@masknet/contracts/abis/ITO2.json'
import ITO_BSC_POLYGON_ABI from '@masknet/contracts/abis/BscPolygonITO.json'
import type { ITO } from '@masknet/contracts/types/ITO'
import type { ITO2 } from '@masknet/contracts/types/ITO2'
import type { BscPolygonITO } from '@masknet/contracts/types/BscPolygonITO'
import { useITOConstants, useContract, isSameAddress, useNetworkType, NetworkType } from '@masknet/web3-shared'

export function useITO_Contract(contractAddress?: string) {
    const { ITO_CONTRACT_ADDRESS, ITO2_CONTRACT_ADDRESS, ITO_BSC_POLYGON_CONTRACT_ADDRESS } = useITOConstants()
    const ITO_CONTRACT = useContract<ITO>(ITO_CONTRACT_ADDRESS, ITO_ABI as AbiItem[])
    const ITO2_CONTRACT = useContract<ITO2>(ITO2_CONTRACT_ADDRESS, ITO2_ABI as AbiItem[])
    const ITO_BSC_POLYGON_CONTRACT = useContract<BscPolygonITO>(
        contractAddress ?? ITO_BSC_POLYGON_CONTRACT_ADDRESS,
        ITO_BSC_POLYGON_ABI as AbiItem[],
    )

    const networkType = useNetworkType()
    if ([NetworkType.Binance, NetworkType.Polygon].includes(networkType)) return {
        contract: ITO_BSC_POLYGON_CONTRACT, version: 1,
    }

    return contractAddress && isSameAddress(contractAddress, ITO_CONTRACT_ADDRESS)
        ? { contract: ITO_CONTRACT, version: 1 }
        : { contract: ITO2_CONTRACT, version: 2 }
}
