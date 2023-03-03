import { Environment, isEnvironment, MessageTarget, type UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import { AsyncCall, type AsyncCallLogLevel, AsyncGeneratorCall } from 'async-call-rpc/full'
import { serializer, getLocalImplementation, getLocalImplementationExotic } from '@masknet/shared-base'

const log: AsyncCallLogLevel = {
    type: 'pretty',
    requestReplay: process.env.NODE_ENV === 'development',
    sendLocalStack: process.env.NODE_ENV === 'development',
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
        (exoticImplementation ? getLocalImplementationExotic : getLocalImplementation)(
            isBackground,
            `Plugin(${key})`,
            impl,
            message,
        ),
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
    return AsyncGeneratorCall<T>(getLocalImplementation(isBackground, `Plugin(${key})`, impl, message), {
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
