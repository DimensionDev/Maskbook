import { WalletConnectQRCodeModal } from '@masknet/shared'
import { EMPTY_ARRAY } from '@masknet/shared-base'
import { initWallet as setup } from '@masknet/web3-providers'
import type { WalletAPI } from '@masknet/web3-providers/types'

async function reject(): Promise<never> {
    throw new Error('Not implemented')
}

const WalletIO: WalletAPI.IOContext = {
    MaskWalletContext: {
        wallets: EMPTY_ARRAY,
        addWallet: reject,
        allPersonas: EMPTY_ARRAY,
        disconnectAllWalletsFromOrigin: reject,
        removeWallet: reject,
        renameWallet: reject,
        resetAllWallets: reject,
        sdk_grantEIP2255Permission: reject,
        selectMaskWalletAccount: reject,
    },
    MessageContext: {
        hasPaymentPassword: reject,
        openPopupWindow: reject,
        send: reject,
    },
    WalletConnectContext: {
        openWalletConnectDialog: async (uri: string) => {
            await WalletConnectQRCodeModal.openAndWaitForClose({ uri })
        },
        closeWalletConnectDialog: () => {
            WalletConnectQRCodeModal.close()
        },
    },
    signWithPersona: reject,
}
export function initWallet() {
    return setup(WalletIO)
}
