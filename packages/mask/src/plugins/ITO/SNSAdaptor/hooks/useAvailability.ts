import { useAsyncRetry } from 'react-use'
import { useAccount, useITOConstants, useChainId, isSameAddress, ChainId } from '@masknet/web3-shared-evm'
import { checkAvailability } from '../../Worker/apis/checkAvailability'

export function useAvailability(id: string, contract_address: string, from?: string, chainId?: ChainId) {
    const account = useAccount()
    const fromAccount = from ?? account
    const _chainId = useChainId()
    const chain_id = chainId ?? _chainId

    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const isV1 = isSameAddress(contract_address ?? '', ITO_CONTRACT_ADDRESS)

    return useAsyncRetry(async () => {
        if (!id || !contract_address) return null
        return checkAvailability(id, fromAccount, contract_address, chain_id, isV1)
    }, [id, account])
}
