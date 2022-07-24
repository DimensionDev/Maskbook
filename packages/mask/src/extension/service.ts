// Notice, this module itself is not HMR ready.
// If you change this file to add a new service, you need to reload.
// This file should not rely on any other in-project files unless it is HMR ready.
import {
    AsyncCall,
    AsyncGeneratorCall,
    AsyncCallOptions,
    CallbackBasedChannel,
    EventBasedChannel,
    AsyncVersionOf,
    AsyncGeneratorVersionOf,
} from 'async-call-rpc/full'
import { isEnvironment, Environment, WebExtensionMessage, MessageTarget } from '@dimensiondev/holoflows-kit'
import { serializer, getLocalImplementation } from '@masknet/shared-base'

const SERVICE_HMR_EVENT = 'service-hmr'
const message = new WebExtensionMessage<Record<string, any>>({ domain: 'services' })
const log: AsyncCallOptions['log'] = {
    type: 'pretty',
    requestReplay: process.env.NODE_ENV === 'development',
}

export const Services = {
    Crypto: add(() => import('../../background/services/crypto'), 'Crypto'),
    Identity: add(() => import('../../background/services/identity'), 'Identity'),
    Backup: add(() => import('./background-script/BackupService'), 'Backup'),
    Helper: add(() => import('../../background/services/helper'), 'Helper'),
    SocialNetwork: add(() => import('../../background/services/site-adaptors'), 'SocialNetwork'),
    Settings: add(() => import('../../background/services/settings'), 'Settings'),
    ThirdPartyPlugin: add(() => import('../../background/services/third-party-plugins'), 'ThirdPartyPlugin'),
}
export default Services
export const ServicesWithProgress: AsyncGeneratorVersionOf<typeof import('./service-generator')> = add(
    () => import('./service-generator'),
    'ServicesWithProgress',
    true,
) as any

if (process.env.manifest === '2' && import.meta.webpackHot && isEnvironment(Environment.ManifestBackground)) {
    import.meta.webpackHot.accept(
        [
            '../../background/services/crypto',
            '../../background/services/identity',
            './background-script/BackupService',
            '../../background/services/helper',
            '../../background/services/settings',
            '../../background/services/third-party-plugins',
            '../../background/services/site-adaptors',
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
function add<T extends object>(impl: () => Promise<T>, key: string, generator = false): AsyncVersionOf<T> {
    const channel: EventBasedChannel | CallbackBasedChannel = message.events[key].bind(MessageTarget.Broadcast)

    const isBackground = isEnvironment(Environment.ManifestBackground)
    const RPC = (generator ? AsyncGeneratorCall : AsyncCall) as any as typeof AsyncCall
    const load = () => getLocalImplementation<T>(isBackground, `Services.${key}`, impl, channel)
    const localImplementation = load()
    // No HMR support in MV3
    process.env.manifest === '2' &&
        isBackground &&
        import.meta.webpackHot &&
        document.addEventListener(SERVICE_HMR_EVENT, load)
    const service = RPC<T>(localImplementation, {
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
    return service
}
