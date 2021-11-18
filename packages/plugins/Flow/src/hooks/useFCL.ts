import { useMemo } from 'react'
import * as SDK from '@masknet/web3-shared-flow'
import { useChainId } from '@masknet/plugin-infra'

export function useFCL() {
    const chainId = useChainId()
    return useMemo(() => {
        return SDK.createClient(chainId)
    }, [chainId])
}
