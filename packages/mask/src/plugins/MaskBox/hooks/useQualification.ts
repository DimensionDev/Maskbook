import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import { useMaskBoxQualificationContract } from './useMaskBoxQualificationContract.js'

export function useQualification(address?: string, account?: string, proof?: string) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const qualificationContract = useMaskBoxQualificationContract(chainId, address)
    const { value: qualification = { qualified: false, error_msg: '' } } = useAsyncRetry(async () => {
        if (!qualificationContract || !account) return null
        return qualificationContract.methods.is_qualified(account, proof ?? '0x00').call({
            from: account,
        })
    }, [account, qualificationContract, proof])
    return qualification
}
