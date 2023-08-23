import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import { AsyncCall, type AsyncCallLogLevel, AsyncGeneratorCall } from 'async-call-rpc/full'
import { serializer, getLocalImplementation, getLocalImplementationExotic } from '@masknet/shared-base'
import type { PluginMessageEmitterItem } from '@masknet/plugin-infra'

const log: AsyncCallLogLevel = {
    type: 'pretty',
    requestReplay: process.env.NODE_ENV === 'development',
    sendLocalStack: process.env.NODE_ENV === 'development',
}
let isBackgroundF = () => isEnvironment(Environment.ManifestBackground)
export function __workaround__replaceIsBackground__(f: () => boolean) {
    isBackgroundF = f
}
export function createPluginRPC<T extends Record<string, (...args: any) => Promise<any>>>(
    key: string,
    impl: () => T | Promise<T>,
    message: PluginMessageEmitterItem<unknown>,
    /** Please set this to true if your implementation is a Proxy. */
    exoticImplementation?: boolean,
): T {
    const isBackground = isBackgroundF()
    return AsyncCall<T>(
        (exoticImplementation ? getLocalImplementationExotic : getLocalImplementation)(
            isBackground,
            `Plugin(${key})`,
            impl,
            message,
        ),
        {
            key,
            channel: {
                on: message.on,
                send: isBackground ? message.sendByBroadcast : message.sendToBackgroundPage,
            },
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
>(key: string, impl: () => Promise<T>, message: PluginMessageEmitterItem<any>): T {
    const isBackground = isBackgroundF()
    return AsyncGeneratorCall<T>(getLocalImplementation(isBackground, `Plugin(${key})`, impl, message), {
        channel: {
            on: message.on,
            send: message.sendByBroadcast,
        },
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
