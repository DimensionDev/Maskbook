import './register.js'

import { noop } from 'lodash-es'
import { Emitter } from '@servie/events'
import { CurrentSNSNetwork, startPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import {
    createConstantSubscription,
    createI18NBundle,
    createKVStorageHost,
    i18NextInstance,
    ValueRefWithReady,
} from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import { ThemeMode, FontSize } from '@masknet/web3-shared-base'
import { addListener } from './message.js'
import { worker } from './rpc.js'
import { BooleanPreference } from '@masknet/public-api'

// #region Setup storage
const inMemoryStorage = createKVStorageHost(
    {
        beforeAutoSync: Promise.resolve(),
        getValue: worker.memoryRead,
        setValue: worker.memoryWrite,
    },
    {
        on: (callback) => addListener('inMemoryStorage', callback),
    },
)
const indexedDBStorage = createKVStorageHost(
    {
        beforeAutoSync: Promise.resolve(),
        getValue: worker.indexedDBRead,
        setValue: worker.indexedDBWrite,
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
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return inMemoryStorage(id, defaultValues, signal)
                else return indexedDBStorage(id, defaultValues, signal)
            },
            account: createConstantSubscription(''),
            chainId: createConstantSubscription(ChainId.Mainnet),
            currentPersona: createConstantSubscription(undefined),
            wallets: createConstantSubscription([]),
            addWallet: reject,
            closePopupWindow: reject,
            closeWalletConnectDialog: reject,
            confirmRequest: reject,
            connectPersona: reject,
            createLogger: () => undefined,
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
            openWalletConnectDialog: reject,
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
    },
    permission: {
        hasPermission: async () => false,
        events: new Emitter(),
    },
})
