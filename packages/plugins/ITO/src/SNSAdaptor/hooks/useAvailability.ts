import { useAsyncRetry } from 'react-use'
import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-evm'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useITOConstants } from '@masknet/web3-shared-evm'
import type { ConnectionOptions_Base } from '@masknet/web3-providers/types'
import { checkAvailability } from '../utils/checkAvailability.js'
import type { Availability } from '../../types.js'

export function useAvailability(
    id: string,
    contractAddress: string,
    options?: ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })
    const { ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const isV1 = isSameAddress(contractAddress ?? '', ITO_CONTRACT_ADDRESS)

    return useAsyncRetry<Availability | null>(async () => {
        if (!id || !contractAddress) return null
        return checkAvailability(id, account, contractAddress, chainId, isV1)
    }, [id, account, chainId, isV1, contractAddress])
}
