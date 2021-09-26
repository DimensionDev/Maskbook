import { useValueRef } from '@masknet/shared'
import { currentMaskWalletLockStatusSettings } from '../../../../../plugins/Wallet/settings'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { LockStatus } from '@masknet/web3-shared'

export function useWalletLockStatus() {
    const lockStatus = useValueRef(currentMaskWalletLockStatusSettings)
    const {
        value: isLocked,
        loading,
        error,
    } = useAsync(async () => {
        if (lockStatus === LockStatus.INIT || lockStatus === LockStatus.UNLOCK) return WalletRPC.isLocked()
        return lockStatus === LockStatus.LOCKED
    }, [lockStatus])

    return {
        error,
        loading,
        isLocked,
    }
}
