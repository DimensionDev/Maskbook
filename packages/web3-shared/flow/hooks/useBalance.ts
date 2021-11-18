import { useAccount } from './useAccount'
import { useMemo } from 'react'

export function useBalance() {
    const { value: account } = useAccount()
    return useMemo(() => {
        return account?.balance ?? '0'
    }, [account?.balance])
}
