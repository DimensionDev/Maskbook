import { AsyncCall, AsyncGeneratorCall, AsyncCallOptions } from 'async-call-rpc/full'
import { isEnvironment, Environment, WebExtensionMessage, MessageTarget } from '@dimensiondev/holoflows-kit'
import * as MockService from './mock-service'
import serializer from '../utils/type-transform/Serialization'
import { ProfileIdentifier, GroupIdentifier, PostIdentifier, PostIVIdentifier, ECKeyIdentifier } from '../database/type'

import { IdentifierMap } from '../database/IdentifierMap'
import BigNumber from 'bignumber.js'

const message = new WebExtensionMessage<{ _: any }>({ domain: 'services' })
const log: AsyncCallOptions['log'] = {
    beCalled: true,
    localError: true,
    remoteError: true,
    sendLocalStack: true,
    type: 'pretty',
    requestReplay: process.env.NODE_ENV === 'development',
}
export const Services = {
    Crypto: add(() => import('./background-script/CryptoService'), 'Crypto', MockService.CryptoService),
    Identity: add(() => import('./background-script/IdentityService'), 'Identity'),
    UserGroup: add(() => import('./background-script/UserGroupService'), 'UserGroup'),
    Welcome: add(() => import('./background-script/WelcomeService'), 'Welcome', MockService.WelcomeService),
    Steganography: add(
        () => import('./background-script/SteganographyService'),
        'Steganography',
        MockService.SteganographyService,
    ),
    Plugin: add(() => import('./background-script/PluginService'), 'Plugin', MockService.PluginService),
    Helper: add(() => import('./background-script/HelperService'), 'Helper', MockService.HelperService),
    Provider: add(() => import('./background-script/ProviderService'), 'Provider'),
    Ethereum: add(() => import('./background-script/EthereumService'), 'Ethereum'),
}
Object.assign(globalThis, { Services })
export default Services
export const ServicesWithProgress = add(() => import('./service-generator'), 'ServicesWithProgress', {}, true)

Object.assign(globalThis, {
    ProfileIdentifier,
    GroupIdentifier,
    PostIdentifier,
    PostIVIdentifier,
    ECKeyIdentifier,
    IdentifierMap,
    BigNumber,
})
Object.defineProperty(BigNumber.prototype, '__debug__amount__', {
    get(this: BigNumber) {
        return this.toNumber()
    },
    configurable: true,
})

/**
 * Helper to add a new service to Services.* / ServicesWithProgress.* namespace.
 * @param impl Implementation of the service. Should be things like () => import("./background-script/CryptoService")
 * @param key Name of the service. Used for better debugging.
 * @param mock The mock Implementation, used in Storybook.
 */
function add<T>(impl: () => Promise<T>, key: string, mock: Partial<T> = {}, generator = false): T {
    const channel = message.events._.bind(process.env.STORYBOOK ? MessageTarget.LocalOnly : MessageTarget.Broadcast)
    const RPC: (impl: any, opts: AsyncCallOptions) => T = (generator ? AsyncGeneratorCall : AsyncCall) as any
    if (process.env.STORYBOOK) {
        // setup mock server in STORYBOOK
        // ? -> UI developing
        RPC(
            new Proxy(mock || {}, {
                get(target: any, key: string) {
                    if (target[key]) return target[key]
                    return async () => void 0
                },
            }),
            { key, serializer: serializer, log: log, channel, strict: false },
        )
    }
    // Only background script need to provide it's implementation.
    const localImplementation = isEnvironment(Environment.ManifestBackground)
        ? // Set original impl back to the globalThis, it will help debugging.
          impl().then((impl) => (Reflect.set(globalThis, key + 'Service', impl), impl))
        : {}
    const service = RPC(localImplementation, {
        key,
        serializer,
        log,
        channel,
        preferLocalImplementation: isEnvironment(Environment.ManifestBackground),
        strict: false,
    })
    Reflect.set(globalThis, key + 'Service', service)
    return service as any
}
