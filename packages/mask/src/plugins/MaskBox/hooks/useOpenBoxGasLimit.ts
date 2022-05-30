import { useMemo } from 'react'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import { useMaskBoxContract } from './useMaskBoxContract'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from '@masknet/plugin-infra/web3'

export function useOpenBoxGasLimit(parameters: [string, string, string, string], config: PayableTx) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const maskBoxContract = useMaskBoxContract(chainId)

    return useMemo(() => {
        if (!maskBoxContract) return '0'
        return maskBoxContract.methods.openBox(...parameters).estimateGas(config)
    }, [parameters, maskBoxContract])
}
