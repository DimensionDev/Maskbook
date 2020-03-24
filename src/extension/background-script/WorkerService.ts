import type { SocialNetworkWorker } from '../../social-network/worker'
import getCurrentNetworkWorker from '../../social-network/utils/getCurrentNetworkWorker'
import type { Identifier } from '../../database/type'
import { GetContext, OnlyRunInContext, MessageCenter } from '@holoflows/kit/es'
import { AsyncCall } from 'async-call-rpc'
import Serialization from '../../utils/type-transform/Serialization'
import { memoize } from 'lodash-es'

type Required<T> = { [P in keyof T]-?: NonNullable<T[P]> }
type ServiceType = Required<Pick<SocialNetworkWorker, 'autoVerifyBio' | 'autoVerifyPost' | 'manualVerifyPost'>>

const getServiceFromNetworkWorker = memoize((worker: SocialNetworkWorker) => {
    return AsyncCall<ServiceType>(undefined, {
        serializer: Serialization,
        key: worker.internalName,
        messageChannel: new MessageCenter(false),
    })
})
export function getCurrentNetworkWorkerService(network: string | Identifier) {
    if (GetContext() === 'background') {
        throw new Error('This function is not for this env')
    }
    const worker = getCurrentNetworkWorker(network)
    return getServiceFromNetworkWorker(worker)
}

export function startWorkerService(e: SocialNetworkWorker) {
    OnlyRunInContext('background', 'defineWorkerService')
    const impl: ServiceType = {
        autoVerifyBio: e.autoVerifyBio!,
        autoVerifyPost: e.autoVerifyPost!,
        manualVerifyPost: e.manualVerifyPost!,
    }
    AsyncCall(impl, {
        serializer: Serialization,
        key: e.internalName,
        messageChannel: new MessageCenter(false),
        log: true,
        strict: { methodNotFound: true, noUndefined: false, unknownMessage: false },
    })
}
