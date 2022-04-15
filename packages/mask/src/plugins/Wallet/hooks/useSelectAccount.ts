import { useCallback } from 'react'
import type { ChainId } from '@masknet/web3-shared-evm'

interface SelectAccountCallback {
    (accounts: string[], chainId: ChainId): Promise<void>
}

let globalCallback: SelectAccountCallback | undefined

export function useSelectAccount() {
    const onSelectAccountPrepare = useCallback((callback: SelectAccountCallback) => {
        if (callback) {
            globalCallback = callback
        }
    }, [])

    const onSelectAccount = useCallback((accounts: string[], chainId: ChainId) => {
        if (!(globalCallback)) return;
            globalCallback(accounts, chainId)
            globalCallback = undefined
        
    }, [])

    return [onSelectAccountPrepare, onSelectAccount] as const
}
