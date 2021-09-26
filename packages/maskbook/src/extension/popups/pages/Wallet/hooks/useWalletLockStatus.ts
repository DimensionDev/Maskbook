import { useValueRef } from '@masknet/shared'
import { currentMaskWalletLockedSettings } from '../../../../../plugins/Wallet/settings'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { LockStatus } from '@masknet/web3-shared'

export function useWalletLockStatus() {
    const isLock = useValueRef(currentMaskWalletLockedSettings)
    const { value: lockStatus, loading } = useAsync(async () => {
        if (isLock === LockStatus.INIT) return WalletRPC.isLocked()
        return isLock === LockStatus.LOCKED
    }, [isLock])

    return {
        isLock: lockStatus,
        loading,
    }
}
