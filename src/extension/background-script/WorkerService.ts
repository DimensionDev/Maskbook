import { SocialNetworkWorker } from '../../social-network/worker'
import getCurrentNetworkWorker from '../../social-network/utils/getCurrentNetworkWorker'
import { Identifier } from '../../database/type'
import { GetContext, AsyncCall, MessageCenter, OnlyRunInContext } from '@holoflows/kit/es'
import Serialization from '../../utils/type-transform/Serialization'

type ServiceType = Required<Pick<SocialNetworkWorker, 'autoVerifyBio' | 'autoVerifyPost'>>
const cache = new Map<SocialNetworkWorker, ServiceType>()

export function getCurrentNetworkWorkerService(network: string | Identifier) {
    if (GetContext() === 'background') {
        throw new Error('This function is not for this env')
    }
    const worker = getCurrentNetworkWorker(network)
    if (cache.has(worker)) return cache.get(worker)!
    const service = AsyncCall<ServiceType>(undefined, { serializer: Serialization, key: worker.name })
    cache.set(worker, service)
    return service
}

const notImplemented = () => {
    throw new Error('Not Implemented')
}
export function startWorkerService(e: SocialNetworkWorker) {
    OnlyRunInContext('background', 'defineWorkerService')
    const impl: ServiceType = {
        autoVerifyBio: e.autoVerifyBio || notImplemented,
        autoVerifyPost: e.autoVerifyPost || notImplemented,
    }
    AsyncCall(impl, { serializer: Serialization, key: e.name })
}
