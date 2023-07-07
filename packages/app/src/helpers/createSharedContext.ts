import { WalletConnectQRCodeModal } from '@masknet/shared'
import { ValueRefWithReady, createConstantSubscription } from '@masknet/shared-base'
import { ThemeMode, FontSize } from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { getPostURL } from '../helpers/getPostURL.js'
import { getPostPayload } from '../helpers/getPostPayload.js'

async function reject(): Promise<never> {
    throw new Error('Not implemented')
}

const emptyValueRef = new ValueRefWithReady<any>()

export function createSharedContext(): Omit<Plugin.SNSAdaptor.SNSAdaptorContext, 'createKVStorage'> {
    return {
        currentPersona: createConstantSubscription(undefined),
        wallets: createConstantSubscription([]),
        share(text) {
            throw new Error('To be implemented.')
        },
        addWallet: reject,
        closePopupWindow: reject,
        confirmRequest: reject,
        connectPersona: reject,
        createPersona: reject,
        currentPersonaIdentifier: emptyValueRef,
        currentVisitingProfile: createConstantSubscription(undefined),
        getPostURL,
        getPostPayload,
        getNextIDPlatform: () => undefined,
        getPersonaAvatar: reject,
        getSocialIdentity: reject,
        getThemeSettings: () => ({ color: '', mode: ThemeMode.Light, size: FontSize.Normal, isDim: false }),
        getWallets: reject,
        hasPaymentPassword: reject,
        lastRecognizedProfile: createConstantSubscription(undefined),
        openDashboard: reject,
        openPopupConnectWindow: reject,
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
        recordConnectedSites: reject,
        rejectRequest: reject,
        removeWallet: reject,
        selectAccount: createConstantSubscription([]),
        setMinimalMode: reject,
        signWithPersona: reject,
        signWithWallet: reject,
        updateWallet: reject,
        send: reject,
        themeSettings: createConstantSubscription(undefined),
    }
}
