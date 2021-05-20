import { useValueRef, isSameAddress } from '@dimensiondev/maskbook-shared'
import { currentSelectedWalletAddressSettings } from '../../../../../maskbook/src/plugins/Wallet/settings'
import { useWallets } from '../api'

export function useWallet(address?: string) {
    const address_ = useValueRef(currentSelectedWalletAddressSettings)
    const wallets = useWallets()
    return wallets.find((x) => isSameAddress(x.address, address ?? address_))
}
