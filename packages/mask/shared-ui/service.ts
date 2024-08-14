// Notice, this module itself is not HMR ready.
// If you change this file to add a new service, you need to reload.
// This file should not rely on any other in-project files unless it is HMR ready.
import {
    AsyncCall,
    AsyncGeneratorCall,
    type AsyncCallOptions,
    type AsyncVersionOf,
    type AsyncGeneratorVersionOf,
} from 'async-call-rpc/full'
import { WebExtensionMessage, assertNotEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { encoder } from '../../shared-base/src/serializer/index.js'
import type {
    BackupService,
    CryptoService,
    GeneratorServices as GeneratorServicesType,
    HelperService,
    IdentityService,
    SettingsService,
    SiteAdaptorService,
    Services as ServicesType,
    WalletService,
} from '../background/services/types.js'
import { setDebugObject } from '@masknet/shared-base'
import type { EventBasedChannel } from 'async-call-rpc'
import { createBridgedServiceChannel } from '../sandbox/client.js'

assertNotEnvironment(Environment.ManifestBackground)

let message: WebExtensionMessage<any>

function getChannel(name: string): EventBasedChannel {
    if (typeof browser !== 'object') return createBridgedServiceChannel(name)
    else {
        message ??= new WebExtensionMessage<any>({ domain: '$' })
        const channel = message.events[name].bind(Environment.ManifestBackground)
        return {
            on(listener) {
                return channel.on((data) => listener(data))
            },
            send(data) {
                return channel.send(data)
            },
        }
    }
}
const log: AsyncCallOptions['log'] = {
    type: 'pretty',
    requestReplay: process.env.NODE_ENV === 'development',
    sendLocalStack: process.env.NODE_ENV === 'development',
}

export const Services: ServicesType = {
    Crypto: add<CryptoService>('Crypto'),
    Identity: add<IdentityService>('Identity'),
    Backup: add<BackupService>('Backup'),
    Helper: add<HelperService>('Helper'),
    SiteAdaptor: add<SiteAdaptorService>('SiteAdaptor'),
    Settings: add<SettingsService>('Settings'),
    Wallet: add<WalletService>('Wallet'),
}
setDebugObject('Services', Services)
export default Services
export const GeneratorServices: AsyncGeneratorVersionOf<GeneratorServicesType> = add('GeneratorServices', true) as any

/**
 * Helper to add a new service to Services.* / GeneratorServices.* namespace.
 * @param key Name of the service. Used for better debugging.
 * @param generator Is the service is a generator?
 */
function add<T extends object>(key: string, generator = false): AsyncVersionOf<T> {
    const channel = getChannel(key)

    const RPC = (generator ? AsyncGeneratorCall : AsyncCall) as any as typeof AsyncCall
    const service = RPC<T>(null, {
        key,
        encoder,
        log,
        channel: {
            on: (c) => channel.on((d) => c(d)),
            send: (d) => channel.send(d),
        },
        strict: true,
        thenable: false,
    })
    return service
}
