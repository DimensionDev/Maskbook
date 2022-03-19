import { useAsyncRetry } from 'react-use'
import { useITOConstants, isSameAddress } from '@masknet/web3-shared-evm'
import { checkAvailability } from '../../Worker/apis/checkAvailability'
import { NetworkPluginID, useAccount, useChainId } from '@masknet/plugin-infra'

export function useAvailability(id: string, contract_address: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const isV1 = isSameAddress(contract_address ?? '', ITO_CONTRACT_ADDRESS)

    return useAsyncRetry(async () => {
        if (!id || !contract_address) return null
        return checkAvailability(id, account, contract_address, chainId, isV1)
    }, [id, account])
}
