import { AsyncCall } from '@holoflows/kit/es/Extension/Async-Call'
import { GetContext, OnlyRunInContext } from '@holoflows/kit/es/Extension/Context'
import * as MockService from './mock-service'
import Serialization from '../utils/type-transform/Serialization'
import { PersonIdentifier, GroupIdentifier, PostIdentifier } from '../database/type'
import { fetchFacebookBio } from '../social-network/facebook.com/fetch-bio'
import { fetchFacebookProvePost } from '../social-network/facebook.com/fetch-prove-post'

interface Services {
    Crypto: typeof import('./background-script/CryptoService')
    People: typeof import('./background-script/PeopleService')
    Welcome: typeof import('./background-script/WelcomeService')
}
const Services: Services = {} as any
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
    fetchs: {
        bio: fetchFacebookBio,
        post: fetchFacebookProvePost,
    },
})
if (GetContext() === 'background') {
    Object.assign(window, { tasks: require('./content-script/tasks') })
    // Run tests
    require('../tests/1to1')
    require('../tests/1toN')
    require('../tests/sign&verify')
    require('../tests/friendship-discover')
    require('./background-script/Debugger')
    Object.assign(window, {
        db: {
            avatar: require('../database/avatar'),
            group: require('../database/group'),
            people: require('../database/people'),
            type: require('../database/type'),
            post: require('../database/post'),
        },
    })
}
//#region
type Service = Record<string, (...args: any[]) => Promise<any>>
async function register<T extends Service>(service: () => Promise<T>, name: keyof Services, mock?: Partial<T>) {
    if (GetContext() === 'background') {
        console.log(`Service ${name} registered in Background page`)
        const loaded = await service()
        Object.assign(Services, { [name]: loaded })
        AsyncCall(loaded, { key: name, serializer: Serialization })
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
