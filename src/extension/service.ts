import { AsyncCall, AsyncGeneratorCall, AsyncCallOptions } from 'async-call-rpc'
import { GetContext, OnlyRunInContext } from '@holoflows/kit/es'
import * as MockService from './mock-service'
import Serialization from '../utils/type-transform/Serialization'
import { ProfileIdentifier, GroupIdentifier, PostIdentifier, PostIVIdentifier, ECKeyIdentifier } from '../database/type'
import { getCurrentNetworkWorkerService } from './background-script/WorkerService'

import tasks from './content-script/tasks'
import { MessageCenter } from '@holoflows/kit/es'
import { IdentifierMap } from '../database/IdentifierMap'

interface Services {
    Crypto: typeof import('./background-script/CryptoService')
    Identity: typeof import('./background-script/IdentityService')
    UserGroup: typeof import('./background-script/UserGroupService')
    Welcome: typeof import('./background-script/WelcomeService')
    Steganography: typeof import('./background-script/SteganographyService')
    Plugin: typeof import('./background-script/PluginService')
}
const Services = {} as Services
export default Services

const logOptions: AsyncCallOptions['log'] = {
    beCalled: true,
    localError: true,
    remoteError: true,
    sendLocalStack: true,
    type: 'pretty',
}
if (!('Services' in globalThis)) {
    Object.assign(globalThis, { Services })
    // Sorry you should add import at '../background-service.ts'
    register(createProxyToService('CryptoService'), 'Crypto', MockService.CryptoService)
    register(createProxyToService('WelcomeService'), 'Welcome', MockService.WelcomeService)
    register(createProxyToService('SteganographyService'), 'Steganography', MockService.SteganographyService)
    register(createProxyToService('IdentityService'), 'Identity', {})
    register(createProxyToService('UserGroupService'), 'UserGroup', {})
    register(createProxyToService('PluginService'), 'Plugin', {})
}
interface ServicesWithProgress {
    // Sorry you should add import at '../background-service.ts'
    decryptFrom: typeof import('./background-script/CryptoServices/decryptFrom').decryptFromMessageWithProgress
}
function createProxyToService(name: string) {
    return new Proxy(
        // @ts-ignore
        globalThis[name] || {},
        {
            get(_, key) {
                // @ts-ignore
                const service = globalThis[name] || {}
                if (key === 'methods') {
                    return () => {
                        return Object.keys(service)
                            .map((f) => f + ': ' + service[f].toString().split('\n')[0])
                            .join('\n')
                    }
                }
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
        messageChannel: new MessageCenter(false),
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
})
//#region
type Service = Record<string, (...args: unknown[]) => Promise<unknown>>
function register<T extends Service>(service: T, name: keyof Services, mock?: Partial<T>) {
    if (OnlyRunInContext(['content', 'options', 'debugging', 'background'], false)) {
        GetContext() !== 'debugging' && console.log(`Service ${name} registered in ${GetContext()}`)
        const mc = new MessageCenter(false)
        // mc.writeToConsole = true
        Object.assign(Services, {
            [name]: AsyncCall(service, {
                key: name,
                serializer: Serialization,
                log: logOptions,
                messageChannel: mc,
            }),
        })
        Object.assign(globalThis, { [name]: Object.assign({}, service) })
        if (GetContext() === 'debugging') {
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
                messageChannel: new MessageCenter(true),
            })
        }
    } else {
        console.warn('Unknown environment, service not registered')
    }
}
//#endregion
