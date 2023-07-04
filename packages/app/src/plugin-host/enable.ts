import './register.js'

import { noop } from 'lodash-es'
import { Emitter } from '@servie/events'
import { CurrentSNSNetwork, SNSAdaptorContextRef, startPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import type { Plugin } from '@masknet/plugin-infra/content-script'
import { WalletConnectQRCodeModal } from '@masknet/shared'
import {
    BooleanPreference,
    createConstantSubscription,
    createI18NBundle,
    createKVStorageHost,
    i18NextInstance,
    ValueRefWithReady,
} from '@masknet/shared-base'
import { setupReactShadowRootEnvironment } from '@masknet/theme'
import type { UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import { ThemeMode, FontSize } from '@masknet/web3-shared-base'
import { addListener } from './message.js'
import * as services from '../plugin-worker/service.js'
// import { PluginWorker } from './rpc.js'

// #region Setup storage
const inMemoryStorage = createKVStorageHost(
    {
        beforeAutoSync: Promise.resolve(),
        getValue: services.memoryRead,
        setValue: services.memoryWrite,
    },
    {
        on: (callback) => addListener('inMemoryStorage', callback),
    },
)
const indexedDBStorage = createKVStorageHost(
    {
        beforeAutoSync: Promise.resolve(),
        getValue: services.indexedDBRead,
        setValue: services.indexedDBWrite,
    },
    {
        on: (callback) => addListener('indexedDBStorage', callback),
    },
)
// #endregion

async function reject(): Promise<never> {
    throw new Error('Not implemented')
}

const asyncNoop = async () => {}
const emptyEventRegistry: UnboundedRegistry<any> = {
    send: noop,
    off: noop,
    on: () => noop,
    sendByBroadcast: noop,
    sendToAll: noop,
    sendToBackgroundPage: noop,
    pause: () => asyncNoop,
    sendToContentScripts: noop,
    sendToFocusedPage: noop,
    sendToLocal: noop,
    sendToVisiblePages: noop,
    bind: () => ({
        off: noop,
        on: () => noop,
        pause: () => asyncNoop,
        send: noop,
    }),
    async *[Symbol.asyncIterator]() {},
}
const emptyValueRef = new ValueRefWithReady<any>()

startPluginSNSAdaptor(CurrentSNSNetwork.__SPA__, {
    minimalMode: {
        events: new Emitter(),
        isEnabled: () => BooleanPreference.True,
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18NextInstance)
    },
    createContext(id, signal) {
        const context: Plugin.SNSAdaptor.SNSAdaptorContext = {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return inMemoryStorage(id, defaultValues, signal)
                else return indexedDBStorage(id, defaultValues, signal)
            },
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
            ownPersonaChanged: emptyEventRegistry,
            ownProofChanged: emptyEventRegistry,
            queryPersonaByProfile: reject,
            recordConnectedSites: reject,
            rejectRequest: reject,
            removeWallet: reject,
            selectAccount: reject,
            setMinimalMode: reject,
            signWithPersona: reject,
            signWithWallet: reject,
            updateWallet: reject,
            send: reject,
            NFTAvatarTimelineUpdated: emptyEventRegistry,
            themeSettings: createConstantSubscription(undefined),
        }

        SNSAdaptorContextRef.value = context

        return context
    },
    permission: {
        hasPermission: async () => false,
        events: new Emitter(),
    },
})

setupReactShadowRootEnvironment({ mode: 'open' }, [])
