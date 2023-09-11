import { WalletConnectQRCodeModal } from '@masknet/shared'
import { EMPTY_ARRAY, UNDEFINED, ValueRefWithReady } from '@masknet/shared-base'
import { ThemeMode, FontSize } from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { getPostURL } from '../helpers/getPostURL.js'
import { getPostPayload } from '../helpers/getPostPayload.js'

async function reject(): Promise<never> {
    throw new Error('Not implemented')
}

const emptyValueRef = new ValueRefWithReady<any>()

export function createSharedContext(): Omit<Plugin.SiteAdaptor.SiteAdaptorContext, 'createKVStorage'> {
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
        currentVisitingProfile: UNDEFINED,
        getPostURL,
        getPostPayload,
        getNextIDPlatform: () => undefined,
        getPersonaAvatar: reject,
        getSocialIdentity: reject,
        getThemeSettings: () => ({ color: '', mode: ThemeMode.Light, size: FontSize.Normal, isDim: false }),
        getWallets: reject,
        hasPaymentPassword: reject,
        lastRecognizedProfile: UNDEFINED,
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
        removeWallet: reject,
        resetAllWallets: reject,
        selectMaskWalletAccount: reject,
        setMinimalMode: reject,
        signWithPersona: reject,
        signWithWallet: reject,
        updateWallet: reject,
        send: reject,
        themeSettings: UNDEFINED,
        allPersonas: EMPTY_ARRAY,
    }
}
