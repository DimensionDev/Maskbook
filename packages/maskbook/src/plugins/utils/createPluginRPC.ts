import { Environment, isEnvironment, MessageTarget, UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import { AsyncCall, AsyncCallLogLevel, AsyncGeneratorCall } from 'async-call-rpc/full'
import serialization from '../../utils/type-transform/Serialization'
const log: AsyncCallLogLevel = {
    beCalled: true,
    localError: true,
    remoteError: true,
    requestReplay: true,
    sendLocalStack: true,
    type: 'pretty',
}
export function createPluginRPC<T>(key: string, impl: () => T | Promise<T>, message: UnboundedRegistry<unknown>) {
    const isBackground = isEnvironment(Environment.ManifestBackground)
    return AsyncCall<T>(isBackground ? impl() : {}, {
        key,
        channel: message.bind(MessageTarget.Broadcast),
        preferLocalImplementation: isBackground,
        serializer: serialization,
        strict: {
            methodNotFound: isBackground,
            unknownMessage: true,
        },
        log,
    })
}

export function createPluginRPCGenerator<T>(impl: () => Promise<T>, message: UnboundedRegistry<any>) {
    const isBackground = isEnvironment(Environment.ManifestBackground)
    return AsyncGeneratorCall<T>(isBackground ? impl() : {}, {
        channel: message.bind(MessageTarget.Broadcast),
        preferLocalImplementation: isBackground,
        serializer: serialization,
        strict: {
            methodNotFound: isBackground,
            unknownMessage: true,
        },
        log,
    })
}
