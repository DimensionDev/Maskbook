import { WalletConnectQRCodeModal } from '@masknet/shared'
import { EMPTY_ARRAY } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { getPostPayload } from './getPostPayload.js'

async function reject(): Promise<never> {
    throw new Error('Not implemented')
}

export function createSharedContext(): Omit<
    Plugin.SiteAdaptor.SiteAdaptorContext,
    'createKVStorage' | 'setMinimalMode'
> {
    return {
        wallets: EMPTY_ARRAY,
        addWallet: reject,
        closePopupWindow: reject,
        connectPersona: reject,
        createPersona: reject,
        getPostPayload,
        getWallets: reject,
        hasPaymentPassword: reject,
        openDashboard: reject,
        openPopupWindow: reject,
        openWalletConnectDialog: async (uri: string) => {
            await WalletConnectQRCodeModal.openAndWaitForClose({
                uri,
            })
        },
        closeWalletConnectDialog: () => {
            WalletConnectQRCodeModal.close()
        },
        grantEIP2255Permission: reject,
        disconnectAllWalletsFromOrigin: reject,
        selectMaskWalletAccount: reject,
        signWithPersona: reject,
        signWithWallet: reject,
        updateWallet: reject,
        send: reject,
    }
}
