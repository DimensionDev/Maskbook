import { useValueRef } from '@masknet/shared'
import { currentMaskWalletLockedSettings } from '../../../../../plugins/Wallet/settings'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'

export function useWalletLockStatus() {
    const { value: initialLockStatus, loading } = useAsync(WalletRPC.isLocked, [])
    const isLock = useValueRef(currentMaskWalletLockedSettings)

    return {
        isLock: initialLockStatus || isLock,
        loading,
    }
}
