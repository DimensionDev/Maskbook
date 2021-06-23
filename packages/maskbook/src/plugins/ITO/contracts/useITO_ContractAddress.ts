import { ITO_CONSTANTS } from '../constants'
import { useConstant, useNetworkType, NetworkType } from '@masknet/web3-shared'

export function useITO_ContractAddress() {
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const ITO_BSC_POLYGON_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_BSC_POLYGON_CONTRACT_ADDRESS')
    const networkType = useNetworkType()

    return networkType === NetworkType.Ethereum ? ITO_CONTRACT_ADDRESS : ITO_BSC_POLYGON_CONTRACT_ADDRESS
}
