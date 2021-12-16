//import { PluginPooltogetherRPC } from '../messages'
import { useAaveProtocolDataProviderContract } from '../contracts/useAaveProtocolDataProvider'
import { useAsyncRetry } from 'react-use'
import { AAVE_ASSETS, AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS } from '../constants'
import type { AaveReserveData, AaveAssetDetails, AavePoolReserveConfigData } from '../types'
import { formatUnits } from '@ethersproject/units'

// export function usePools() {
//     const chainId = useChainId()
//     return useAsyncRetry(() => PluginPooltogetherRPC.fetchPools(chainId), [chainId])
// }

export function useAaveProtocolPoolGetReserveConfig(assetAddress: string) {
    const dataProviderContract = useAaveProtocolDataProviderContract(AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS)

    return useAsyncRetry(async () => {
        //@ts-ignore
        const reserveData: AavePoolReserveConfigData = await dataProviderContract.methods.getReserveConfigurationData(assetAddress).call()
        return reserveData
    }, [])
}

