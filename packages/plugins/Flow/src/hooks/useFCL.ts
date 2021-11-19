import { useMemo } from 'react'
import * as SDK from '@masknet/web3-shared-flow'

export function useFCL() {
    return useMemo(() => {
        return SDK.createClient(SDK.ChainId.Testnet)
    }, [])
}
