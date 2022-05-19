import { useAsyncRetry } from 'react-use'
import { useAccount, useITOConstants, isSameAddress, ChainId } from '@masknet/web3-shared-evm'
import { checkAvailability } from '../../Worker/apis/checkAvailability'

export function useAvailability(id: string, contract_address: string, chainId: ChainId, from?: string) {
    const account = useAccount()
    const fromAccount = from ?? account

    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const isV1 = isSameAddress(contract_address ?? '', ITO_CONTRACT_ADDRESS)

    return useAsyncRetry(async () => {
        if (!id || !contract_address) return null
        return checkAvailability(id, account || fromAccount, contract_address, chainId, isV1)
    }, [id, account, fromAccount, chainId])
}
