import { AsyncCall, AsyncGeneratorCall, AsyncCallOptions } from 'async-call-rpc/full'
import { GetContext, OnlyRunInContext } from '@holoflows/kit/es'
import * as MockService from './mock-service'
import Serialization from '../utils/type-transform/Serialization'
import { ProfileIdentifier, GroupIdentifier, PostIdentifier, PostIVIdentifier, ECKeyIdentifier } from '../database/type'
import { getCurrentNetworkWorkerService } from './background-script/WorkerService'

import { MessageCenter } from '@holoflows/kit/es'
import { IdentifierMap } from '../database/IdentifierMap'
import type { upload as pluginArweaveUpload } from '../plugins/FileService/arweave/index'
import BigNumber from 'bignumber.js'

interface Services {
    Crypto: typeof import('./background-script/CryptoService')
    Identity: typeof import('./background-script/IdentityService')
    UserGroup: typeof import('./background-script/UserGroupService')
    Welcome: typeof import('./background-script/WelcomeService')
    Steganography: typeof import('./background-script/SteganographyService')
    Plugin: typeof import('./background-script/PluginService')
    Helper: typeof import('./background-script/HelperService')
    Nonce: typeof import('./background-script/NonceService')
    Provider: typeof import('./background-script/ProviderService')
}
const Services = {} as Services
export default Services

const logOptions: AsyncCallOptions['log'] = {
    beCalled: true,
    localError: true,
    remoteError: true,
    sendLocalStack: true,
    type: 'pretty',
    requestReplay: process.env.NODE_ENV === 'development',
}
if (!('Services' in globalThis)) {
    Object.assign(globalThis, { Services })
    // Sorry you should add import at '../_background_loader.1.ts'
    register(createProxyToService('CryptoService'), 'Crypto', MockService.CryptoService)
    register(createProxyToService('WelcomeService'), 'Welcome', MockService.WelcomeService)
    register(createProxyToService('SteganographyService'), 'Steganography', MockService.SteganographyService)
    register(createProxyToService('IdentityService'), 'Identity', {})
    register(createProxyToService('UserGroupService'), 'UserGroup', {})
    register(createProxyToService('PluginService'), 'Plugin', MockService.PluginService)
    register(createProxyToService('HelperService'), 'Helper', MockService.HelperService)
    register(createProxyToService('NonceService'), 'Nonce', {})
    register(createProxyToService('ProviderService'), 'Provider', {})
}
interface ServicesWithProgress {
    // Sorry you should add import at '../_background_loader.1.ts'
    pluginArweaveUpload: typeof pluginArweaveUpload
    decryptFromText: typeof import('./background-script/CryptoServices/decryptFrom').decryptFromText
    decryptFromImageUrl: typeof import('./background-script/CryptoServices/decryptFrom').decryptFromImageUrl
}
function createProxyToService(name: string) {
    return new Proxy(
        // @ts-ignore
        globalThis[name] || {},
        {
            get(_, key) {
                // @ts-ignore
                const service = globalThis[name] || {}
                if (key === 'methods')
                    return () =>
                        Object.keys(service)
                            .map((f) => f + ': ' + service[f].toString().split('\n')[0])
                            .join('\n')
                return service[key]
            },
        },
    )
}
export const ServicesWithProgress = AsyncGeneratorCall<ServicesWithProgress>(
    createProxyToService('ServicesWithProgress'),
    {
        key: 'Service+',
        log: logOptions,
        serializer: Serialization,
        channel: new MessageCenter(false, 'service-progress').eventBasedChannel,
        strict: false,
    },
)

Object.assign(globalThis, {
    ProfileIdentifier,
    GroupIdentifier,
    PostIdentifier,
    PostIVIdentifier,
    getCurrentNetworkWorkerService,
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

//#region
type Service = Record<string, (...args: unknown[]) => Promise<unknown>>
function register<T extends Service>(service: T, name: keyof Services, mock?: Partial<T>) {
    if (OnlyRunInContext(['content', 'options', 'debugging', 'background'], false) || process.env.STORYBOOK) {
        GetContext() !== 'debugging' && console.log(`Service ${name} registered in ${GetContext()}`)
        const mc = new MessageCenter(process.env.STORYBOOK ? true : false, name)
        Object.assign(Services, {
            [name]: AsyncCall(service, {
                key: name,
                serializer: Serialization,
                log: logOptions,
                channel: mc.eventBasedChannel,
                preferLocalImplementation: GetContext() === 'background',
                strict: false,
            }),
        })
        Object.assign(globalThis, { [name]: Object.assign({}, service) })
        if (process.env.STORYBOOK) {
            // ? -> UI developing
            const mockService = new Proxy(mock || {}, {
                get(target: any, key: string) {
                    return async function (...args: any[]) {
                        if (target[key]) return target[key](...args)
                        return void 0
                    }
                },
            })
            AsyncCall(mockService, {
                key: name,
                serializer: Serialization,
                log: logOptions,
                channel: mc.eventBasedChannel,
                strict: false,
            })
        }
    } else {
        console.warn('Unknown environment, service not registered')
    }
}
//#endregion
