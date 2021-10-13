// Notice, this module itself is not HMR ready.
// If you change this file to add a new service, you need to reload.
// This file should not rely on any other in-project files unless it is HMR ready.
import {
    AsyncCall,
    AsyncGeneratorCall,
    AsyncCallOptions,
    CallbackBasedChannel,
    EventBasedChannel,
} from 'async-call-rpc/full'
import { isEnvironment, Environment, WebExtensionMessage, MessageTarget } from '@dimensiondev/holoflows-kit'
import { serializer, getLocalImplementation } from '@masknet/shared'

const SERVICE_HMR_EVENT = 'service-hmr'
const message = new WebExtensionMessage<Record<string, any>>({ domain: 'services' })
const log: AsyncCallOptions['log'] = {
    beCalled: true,
    localError: true,
    remoteError: true,
    sendLocalStack: true,
    type: 'pretty',
    requestReplay: process.env.NODE_ENV === 'development',
}

export const Services = {
    Crypto: add(() => import('./background-script/CryptoService'), 'Crypto'),
    Identity: add(() => import('./background-script/IdentityService'), 'Identity'),
    Welcome: add(() => import('./background-script/WelcomeService'), 'Welcome'),
    Steganography: add(() => import('./background-script/SteganographyService'), 'Steganography'),
    Helper: add(() => import('./background-script/HelperService'), 'Helper'),
    Ethereum: add(() => import('./background-script/EthereumService'), 'Ethereum'),
    SocialNetwork: add(() => import('./background-script/SocialNetworkService'), 'SocialNetwork'),
    Settings: add(() => import('./background-script/SettingsService'), 'Settings'),
    ThirdPartyPlugin: add(() => import('./background-script/ThirdPartyPlugin'), 'ThirdPartyPlugin'),
}
export default Services
export const ServicesWithProgress = add(() => import('./service-generator'), 'ServicesWithProgress', true)

if (import.meta.webpackHot && isEnvironment(Environment.ManifestBackground)) {
    import.meta.webpackHot.accept(
        [
            './background-script/CryptoService',
            './background-script/IdentityService',
            './background-script/WelcomeService',
            './background-script/SteganographyService',
            './background-script/HelperService',
            './background-script/EthereumService',
            './background-script/SettingsService',
            './background-script/ThirdPartyPlugin',
            './background-script/SocialNetworkService',
            './service-generator',
        ],
        () => document.dispatchEvent(new Event(SERVICE_HMR_EVENT)),
    )
}

/**
 * Helper to add a new service to Services.* / ServicesWithProgress.* namespace.
 * @param impl Implementation of the service. Should be things like () => import("./background-script/CryptoService")
 * @param key Name of the service. Used for better debugging.
 * @param generator Is the service is a generator?
 */
function add<T>(impl: () => Promise<T>, key: string, generator = false): T {
    const channel: EventBasedChannel | CallbackBasedChannel = message.events[key].bind(MessageTarget.Broadcast)

    const isBackground = isEnvironment(Environment.ManifestBackground)
    const RPC: (impl: any, opts: AsyncCallOptions) => T = (generator ? AsyncGeneratorCall : AsyncCall) as any
    const load = () => getLocalImplementation(`Services.${key}`, impl, channel)
    const localImplementation = load()
    isBackground && import.meta.webpackHot && document.addEventListener(SERVICE_HMR_EVENT, load)
    const service = RPC(localImplementation, {
        key,
        serializer,
        log,
        channel,
        preferLocalImplementation: isBackground,
        strict: isBackground,
        thenable: false,
    })
    if (isBackground) {
        localImplementation.then((val) => {
            Reflect.set(globalThis, key + 'Service', val)
            if (isBackground) Reflect.set(Services, key, val)
        })
    } else {
        Reflect.set(globalThis, key + 'Service', service)
        if (isBackground) Reflect.set(Services, key, service)
    }
    return service as any
}
