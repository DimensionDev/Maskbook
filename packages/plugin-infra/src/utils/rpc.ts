import { Environment, isEnvironment, MessageTarget, UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import { AsyncCall, AsyncCallLogLevel, AsyncGeneratorCall } from 'async-call-rpc/full'
import { serializer, getLocalImplementation, getLocalImplementationExotic } from '@masknet/shared'
const log: AsyncCallLogLevel = {
    beCalled: true,
    localError: true,
    remoteError: true,
    requestReplay: true,
    sendLocalStack: true,
    type: 'pretty',
}
export function createPluginRPC<T extends Record<string, (...args: any) => Promise<any>>>(
    key: string,
    impl: () => T | Promise<T>,
    message: UnboundedRegistry<unknown>,
    /** Please set this to true if your implementation is a Proxy. */
    exoticImplementation?: boolean,
): T {
    const isBackground = isEnvironment(Environment.ManifestBackground)
    return AsyncCall<T>(
        (exoticImplementation ? getLocalImplementationExotic : getLocalImplementation)(`Plugin(${key})`, impl, message),
        {
            key,
            channel: message.bind(MessageTarget.Broadcast),
            preferLocalImplementation: isBackground,
            serializer,
            strict: {
                methodNotFound: isBackground,
                unknownMessage: true,
            },
            log,
            thenable: false,
        },
    ) as any
}

export function createPluginRPCGenerator<
    T extends Record<string, (...args: any[]) => Generator<any> | AsyncGenerator<any>>,
>(key: string, impl: () => Promise<T>, message: UnboundedRegistry<any>): T {
    const isBackground = isEnvironment(Environment.ManifestBackground)
    return AsyncGeneratorCall<T>(getLocalImplementation(`Plugin(${key})`, impl, message), {
        channel: message.bind(MessageTarget.Broadcast),
        preferLocalImplementation: isBackground,
        serializer,
        strict: {
            methodNotFound: isBackground,
            unknownMessage: true,
        },
        log,
        thenable: false,
    }) as any
}
