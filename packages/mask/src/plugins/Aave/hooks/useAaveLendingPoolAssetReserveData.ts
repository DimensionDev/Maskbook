//import { PluginPooltogetherRPC } from '../messages'
import { useAsyncRetry } from 'react-use'
import type { AaveAssetReserve } from '../types'
import { useAaveLendingPoolContract } from '../contracts/useAaveLendingPool'

export function useAaveLendingPoolAssetReserveData(poolAddress: string, assetAddress: string) {
    const poolContract = useAaveLendingPoolContract(poolAddress)

    return useAsyncRetry(async () => {
        //@ts-ignore
        const poolReserveData: AaveAssetReserve = await poolContract.methods.getReserveData(assetAddress).call()

        return poolReserveData
    }, [])
}
