import { Environment, isEnvironment, MessageTarget, UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import serialization from '../../utils/type-transform/Serialization'
export function createPluginRPC<T>(impl: () => Promise<T>, message: UnboundedRegistry<unknown>) {
    const isBackground = isEnvironment(Environment.ManifestBackground)
    return AsyncCall<T>(isBackground ? impl() : {}, {
        channel: message.bind(MessageTarget.Broadcast),
        preferLocalImplementation: isBackground,
        serializer: serialization,
        strict: {
            methodNotFound: isBackground,
            unknownMessage: true,
        },
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
    })
}
