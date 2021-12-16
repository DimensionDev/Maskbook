//import { PluginPooltogetherRPC } from '../messages'
import { useAaveProtocolDataProviderContract } from '../contracts/useAaveProtocolDataProvider'
import { useAsyncRetry } from 'react-use'
import { AAVE_ASSETS, AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS } from '../constants'
import type { AaveReserveData, AaveAssetReserve } from '../types'
import { formatUnits } from '@ethersproject/units'
import { useAaveLendingPoolContract } from '../contracts/useAaveLendingPool'



export function useAaveLendingPoolAssetReserveData(poolAddress: string, assetAddress: string) {
    
    const poolContract = useAaveLendingPoolContract(poolAddress)

    return useAsyncRetry(async () => {
       //@ts-ignore
       const poolReserveData: AaveAssetReserve = await poolContract.methods
       .getReserveData(assetAddress)
       .call()
       
       return poolReserveData;
    }, [])
}
