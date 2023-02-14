import { Emitter } from '@servie/events'
import { BooleanPreference, CurrentSNSNetwork, startPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import {
    createConstantSubscription,
    createI18NBundle,
    createIndexedDB_KVStorageBackend,
    createInMemoryKVStorageBackend,
    createKVStorageHost,
    i18NextInstance,
    KVStorageBackend,
} from '@masknet/shared-base'
import { noop } from 'lodash-es'
import { ChainId } from '@masknet/web3-shared-evm'
import type { UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import { ThemeMode, FontSize } from '@masknet/web3-shared-base'
import { None } from 'ts-results-es'

// #region Setup storage
const memory: KVStorageBackend = {
    beforeAutoSync: Promise.resolve(),
    async getValue(...args) {
        return None
    },
    async setValue(...args) {},
}
const indexedDB: KVStorageBackend = {
    beforeAutoSync: Promise.resolve(),
    async getValue(...args) {
        return None
    },
    async setValue(...args) {},
}
const inMemoryStorage = createKVStorageHost(createInMemoryKVStorageBackend(noop), {
    on: () => noop,
})
const indexedDBStorage = createKVStorageHost(createIndexedDB_KVStorageBackend('mask-plugin', noop), {
    on: () => noop,
})
// #endregion

async function reject(): Promise<never> {
    throw new Error('Not implemented')
}

const reg: UnboundedRegistry<any> = {}

export async function startPluginHost() {
    startPluginSNSAdaptor(CurrentSNSNetwork.Unknown, {
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
                createLogger: reject,
                createPersona: reject,
                currentPersonaIdentifier: reg,
                currentVisitingProfile: createConstantSubscription(undefined),
                getNextIDPlatform: () => undefined,
                getPersonaAvatar: reject,
                getSocialIdentity: reject,
                getThemeSettings: () => ({ color: '', mode: ThemeMode.Light, size: FontSize.Normal }),
                getWallets: reject,
                hasNativeAPI: false,
                hasPaymentPassword: reject,
                lastRecognizedProfile: createConstantSubscription(undefined),
                openDashboard: reject,
                openPopupConnectWindow: reject,
                openPopupWindow: reject,
                openWalletConnectDialog: reject,
                ownPersonaChanged: reg,
                ownProofChanged: reg,
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
                NFTAvatarTimelineUpdated: reg,
                themeSettings: createConstantSubscription(undefined),
            }
        },
        permission: {
            hasPermission: async () => false,
            events: new Emitter(),
        },
    })
}
