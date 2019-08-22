import { AsyncCall } from '@holoflows/kit/es/util/AsyncCall'
import { GetContext, OnlyRunInContext } from '@holoflows/kit/es/Extension/Context'
import * as MockService from './mock-service'
import Serialization from '../utils/type-transform/Serialization'
import { PersonIdentifier, GroupIdentifier, PostIdentifier } from '../database/type'
import { getCurrentNetworkWorkerService } from './background-script/WorkerService'

import tasks from './content-script/tasks'
Object.assign(window, { tasks })

interface Services {
    Crypto: typeof import('./background-script/CryptoService')
    People: typeof import('./background-script/PeopleService')
    Welcome: typeof import('./background-script/WelcomeService')
}
const Services = {} as Services
export default Services
if (!('Services' in window)) {
    Object.assign(window, { Services })
    register(() => import('./background-script/CryptoService'), 'Crypto', MockService.CryptoService)
    register(() => import('./background-script/WelcomeService'), 'Welcome', MockService.WelcomeService)
    register(() => import('./background-script/PeopleService'), 'People', MockService.PeopleService)
}

Object.assign(window, {
    PersonIdentifier,
    GroupIdentifier,
    PostIdentifier,
    getCurrentNetworkWorkerService,
})
if (GetContext() === 'background') {
    // Run tests
    import('../tests/1to1')
    import('../tests/1toN')
    import('../tests/sign&verify')
    import('../tests/friendship-discover')
    import('../tests/comment')
    Promise.all([
        import('../database/avatar'),
        import('../database/group'),
        import('../database/people'),
        import('../database/type'),
        import('../database/post'),
    ]).then(([avatar, group, people, type, post]) => {
        Object.assign(window, { db: { avatar, group, people, type, post } })
    })
    Promise.all([import('../network/gun/version.1'), import('../network/gun/version.2')]).then(([gun1, gun2]) => {
        Object.assign(window, { gun1, gun2 })
    })
    Promise.all([import('../crypto/crypto-alpha-40'), import('../crypto/crypto-alpha-39')]).then(
        ([crypto40, crypto39]) => {
            Object.assign(window, { crypto40, crypto39 })
        },
    )
}
//#region
type Service = Record<string, (...args: any[]) => Promise<any>>
function register<T extends Service>(loadService: () => Promise<T>, name: keyof Services, mock?: Partial<T>) {
    if (GetContext() === 'background') {
        console.log(`Service ${name} registered in Background page`)
        loadService().then(service => {
            Object.assign(Services, { [name]: service })
            Object.assign(window, { [name]: service })
            AsyncCall(service, { key: name, serializer: Serialization })
        })
    } else if (OnlyRunInContext(['content', 'options', 'debugging'], false)) {
        Object.assign(Services, { [name]: AsyncCall({}, { key: name, serializer: Serialization }) })
        if (GetContext() === 'debugging') {
            // ? -> UI developing
            console.log(`Service ${name} mocked`)
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
