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
import { serializer } from '@dimensiondev/maskbook-shared'
import { getLocalImplementation } from '../utils/getLocalImplementation'

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

export class MultiShotChannel implements CallbackBasedChannel {
    newConnection(e: EventBasedChannel) {
        e.on(async (data) => {
            const result = await this.handler(data)
            result && e.send(result)
        })
    }
    private handler!: (p: unknown) => Promise<unknown | undefined>
    setup(callback: (p: unknown) => Promise<unknown | undefined>) {
        this.handler = callback
    }
}
export const BackgroundServicesAdditionalConnections: Record<string, MultiShotChannel> = {}
export const Services = {
    Crypto: add(() => import('./background-script/CryptoService'), 'Crypto'),
    Identity: add(() => import('./background-script/IdentityService'), 'Identity'),
    UserGroup: add(() => import('./background-script/UserGroupService'), 'UserGroup'),
    Welcome: add(() => import('./background-script/WelcomeService'), 'Welcome'),
    Steganography: add(() => import('./background-script/SteganographyService'), 'Steganography'),
    Helper: add(() => import('./background-script/HelperService'), 'Helper'),
    Provider: add(() => import('./background-script/ProviderService'), 'Provider'),
    Ethereum: add(() => import('./background-script/EthereumService'), 'Ethereum'),
    ImageShuffle: add(() => import('./background-script/ImageShuffleService'), 'ImageShuffle'),
}
export default Services
export const ServicesWithProgress = add(() => import('./service-generator'), 'ServicesWithProgress', {}, true)

if (module.hot && isEnvironment(Environment.ManifestBackground)) {
    module.hot.accept(
        [
            './background-script/CryptoService',
            './background-script/IdentityService',
            './background-script/UserGroupService',
            './background-script/WelcomeService',
            './background-script/SteganographyService',
            './background-script/HelperService',
            './background-script/ProviderService',
            './background-script/EthereumService',
            './service-generator',
        ],
        () => document.dispatchEvent(new Event(SERVICE_HMR_EVENT)),
    )
}

/**
 * Helper to add a new service to Services.* / ServicesWithProgress.* namespace.
 * @param impl Implementation of the service. Should be things like () => import("./background-script/CryptoService")
 * @param key Name of the service. Used for better debugging.
 * @param mock The mock Implementation, used in Storybook.
 * @param generator Is the service is a generator?
 */
function add<T>(impl: () => Promise<T>, key: string, mock: Partial<T> = {}, generator = false): T {
    let channel: EventBasedChannel | CallbackBasedChannel = message.events[key].bind(
        process.env.STORYBOOK ? MessageTarget.LocalOnly : MessageTarget.Broadcast,
    )

    const isBackground = isEnvironment(Environment.ManifestBackground)
    if (isBackground) {
        const serverChannel =
            BackgroundServicesAdditionalConnections[key] ||
            (BackgroundServicesAdditionalConnections[key] = new MultiShotChannel())
        serverChannel.newConnection(channel)
        channel = serverChannel
    }
    const RPC: (impl: any, opts: AsyncCallOptions) => T = (generator ? AsyncGeneratorCall : AsyncCall) as any
    const load = () => getLocalImplementation(`Services.${key}`, impl, channel)
    const localImplementation = load()
    module.hot && document.addEventListener(SERVICE_HMR_EVENT, load)
    const service = RPC(localImplementation, {
        key,
        serializer,
        log,
        channel,
        preferLocalImplementation: isBackground,
        strict: isBackground,
        thenable: false,
    })
    Reflect.set(globalThis, key + 'Service', service)
    return service as any
}
