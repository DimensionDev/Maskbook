import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { useWhitelistContract } from './useWhitelistContract'

export function useIsWhitelisted(address?: string, account?: string) {
    const contract = useWhitelistContract(address)
    const result = useAsyncRetry(async () => {
        if (!contract || !account) return null
        return contract.methods.is_qualified(account, '0x00').call()
    }, [account, contract])

    return useMemo(() => result.value ?? { qualified: false, error_msg: '' }, [result])
}
