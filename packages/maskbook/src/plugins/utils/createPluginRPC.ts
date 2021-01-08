import { Environment, isEnvironment, MessageTarget, UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import { AsyncCall, AsyncCallLogLevel, AsyncGeneratorCall } from 'async-call-rpc/full'
import { getLocalImplementation } from '../../utils/getLocalImplementation'
import serialization from '../../utils/type-transform/Serialization'
const log: AsyncCallLogLevel = {
    beCalled: true,
    localError: true,
    remoteError: true,
    requestReplay: true,
    sendLocalStack: true,
    type: 'pretty',
}
export function createPluginRPC<T extends object>(
    key: string,
    impl: () => T | Promise<T>,
    message: UnboundedRegistry<unknown>,
) {
    const isBackground = isEnvironment(Environment.ManifestBackground)
    return AsyncCall<T>(getLocalImplementation(`Plugin(${key})`, impl, message), {
        key,
        channel: message.bind(MessageTarget.Broadcast),
        preferLocalImplementation: isBackground,
        serializer: serialization,
        strict: {
            methodNotFound: isBackground,
            unknownMessage: true,
        },
        log,
        thenable: false,
    })
}

export function createPluginRPCGenerator<T extends object>(
    key: string,
    impl: () => Promise<T>,
    message: UnboundedRegistry<any>,
) {
    const isBackground = isEnvironment(Environment.ManifestBackground)
    return AsyncGeneratorCall<T>(getLocalImplementation(`Plugin(${key})`, impl, message), {
        channel: message.bind(MessageTarget.Broadcast),
        preferLocalImplementation: isBackground,
        serializer: serialization,
        strict: {
            methodNotFound: isBackground,
            unknownMessage: true,
        },
        log,
        thenable: false,
    })
}
