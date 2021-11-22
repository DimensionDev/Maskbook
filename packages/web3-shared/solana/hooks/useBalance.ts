import { useMemo } from 'react'
import { useAccount } from './useAccount'

export function useBalance() {
    const { value: account } = useAccount()
    return useMemo(() => {
        return account?.balance ?? '0'
    }, [account?.balance])
}
