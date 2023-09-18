import { WalletConnectQRCodeModal } from '@masknet/shared'
import { EMPTY_ARRAY, UNDEFINED, ValueRefWithReady } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { getPostURL } from '../helpers/getPostURL.js'
import { getPostPayload } from '../helpers/getPostPayload.js'

async function reject(): Promise<never> {
    throw new Error('Not implemented')
}

const emptyValueRef = new ValueRefWithReady<any>()

export function createSharedContext(): Omit<
    Plugin.SiteAdaptor.SiteAdaptorContext,
    'createKVStorage' | 'setWeb3State' | 'setMinimalMode'
> {
    return {
        currentPersona: UNDEFINED,
        wallets: EMPTY_ARRAY,
        share(text) {
            throw new Error('To be implemented.')
        },
        addWallet: reject,
        closePopupWindow: reject,
        connectPersona: reject,
        createPersona: reject,
        currentPersonaIdentifier: emptyValueRef,
        getPostURL,
        getPostPayload,
        getSocialIdentity: reject,
        getWallets: reject,
        hasPaymentPassword: reject,
        openDashboard: reject,
        openPopupWindow: reject,
        fetchJSON: reject,
        openWalletConnectDialog: async (uri: string) => {
            await WalletConnectQRCodeModal.openAndWaitForClose({
                uri,
            })
        },
        closeWalletConnectDialog: () => {
            WalletConnectQRCodeModal.close()
        },
        queryPersonaByProfile: reject,
        grantEIP2255Permission: reject,
        disconnectAllWalletsFromOrigin: reject,
        selectMaskWalletAccount: reject,
        signWithPersona: reject,
        signWithWallet: reject,
        updateWallet: reject,
        send: reject,
    }
}
