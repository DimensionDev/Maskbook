import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { useWhitelistContract } from './useWhitelistContract'

export function useIsWhitelisted(address?: string, account?: string, proof?: string) {
    const contract = useWhitelistContract(address)
    const result = useAsyncRetry(async () => {
        if (!contract || !account) return null
        return contract.methods.is_qualified(account, proof ?? '0x00').call()
    }, [account, contract, proof])

    return useMemo(() => result.value ?? { qualified: false, error_msg: '' }, [result.value])
}
