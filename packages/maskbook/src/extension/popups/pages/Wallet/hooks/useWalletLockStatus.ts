import { useValueRef } from '@masknet/shared'
import { currentMaskWalletLockedSettings } from '../../../../../plugins/Wallet/settings'

export function useWalletLockStatus() {
    return useValueRef(currentMaskWalletLockedSettings)
}
