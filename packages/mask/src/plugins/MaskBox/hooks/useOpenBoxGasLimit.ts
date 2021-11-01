import { useMemo } from 'react'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useOpenBoxGasLimit(parameters: [string, string, string, string], config: PayableTx) {
    const maskBoxContract = useMaskBoxContract()

    return useMemo(() => {
        if (!maskBoxContract) return '0'
        return maskBoxContract.methods.openBox(...parameters).estimateGas(config)
    }, [parameters, maskBoxContract])
}
