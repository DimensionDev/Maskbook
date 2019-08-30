import { AsyncCall } from '@holoflows/kit/es/util/AsyncCall'
import { GetContext, OnlyRunInContext } from '@holoflows/kit/es/Extension/Context'
import * as MockService from './mock-service'
import Serialization from '../utils/type-transform/Serialization'
import { PersonIdentifier, GroupIdentifier, PostIdentifier, PostIVIdentifier } from '../database/type'
import { getCurrentNetworkWorkerService } from './background-script/WorkerService'

import tasks from './content-script/tasks'
Object.assign(globalThis, { tasks })

interface Services {
    Crypto: typeof import('./background-script/CryptoService')
    People: typeof import('./background-script/PeopleService')
    Welcome: typeof import('./background-script/WelcomeService')
}
const Services = {} as Services
export default Services
if (!('Services' in globalThis)) {
    Object.assign(globalThis, { Services })
    // Sorry you should add import at '../background-service.ts'
    register(Reflect.get(globalThis, 'CryptoService'), 'Crypto', MockService.CryptoService)
    register(Reflect.get(globalThis, 'WelcomeService'), 'Welcome', MockService.WelcomeService)
    register(Reflect.get(globalThis, 'PeopleService'), 'People', MockService.PeopleService)
}

Object.assign(globalThis, {
    PersonIdentifier,
    GroupIdentifier,
    PostIdentifier,
    PostIVIdentifier,
    getCurrentNetworkWorkerService,
})
//#region
type Service = Record<string, (...args: any[]) => Promise<any>>
function register<T extends Service>(service: T, name: keyof Services, mock?: Partial<T>) {
    if (GetContext() === 'background') {
        console.log(`Service ${name} registered in Background page`)
        Object.assign(Services, { [name]: service })
        Object.assign(globalThis, { [name]: service })
        AsyncCall(service, { key: name, serializer: Serialization })
    } else if (OnlyRunInContext(['content', 'options', 'debugging'], false)) {
        Object.assign(Services, { [name]: AsyncCall({}, { key: name, serializer: Serialization }) })
        if (GetContext() === 'debugging') {
            // ? -> UI developing
            const mockService = new Proxy(mock || {}, {
                get(target: any, key: string) {
                    return async function(...args: any[]) {
                        if (target[key]) return target[key](...args)
                        return void 0
                    }
                },
            })
            AsyncCall(mockService, { key: name, serializer: Serialization })
        }
    } else {
        console.warn('Unknown environment, service not registered')
    }
}
//#endregion
