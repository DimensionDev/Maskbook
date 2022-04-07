// Notice, this module itself is not HMR ready.
// If you change this file to add a new service, you need to reload.
// This file should not rely on any other in-project files unless it is HMR ready.
import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { assertEnvironment, Environment, MessageTarget, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { getLocalImplementation, serializer } from '@masknet/shared-base'
import type { GeneratorServices, Services } from './types'
assertEnvironment(Environment.ManifestBackground)

const debugMode = process.env.NODE_ENV === 'development' || process.env.engine === 'safari'
const message = new WebExtensionMessage<Record<string, any>>({ domain: 'services' })
const hmr = new EventTarget()

// #region Setup services
setup('Crypto', () => import('./crypto'))
import.meta.webpackHot && import.meta.webpackHot.accept(['./crypto'], () => hmr.dispatchEvent(new Event('crypto')))

setup('Helper', () => import('./helper'))
import.meta.webpackHot && import.meta.webpackHot.accept(['./helper'], () => hmr.dispatchEvent(new Event('helper')))

function setup<K extends keyof Services>(key: K, implementation: () => Promise<Services[K]>) {
    const channel = message.events[key].bind(MessageTarget.Broadcast)

    async function load() {
        const val = await getLocalImplementation(true, `Services.${key}`, implementation, channel)
        if (debugMode) {
            Reflect.defineProperty(globalThis, key + 'Service', { configurable: true, value: val })
        }
        return val
    }
    load()

    if (import.meta.webpackHot) hmr.addEventListener(key, load)

    // setup server
    AsyncCall(load, {
        key,
        serializer,
        channel,
        log: {
            beCalled: false,
            remoteError: false,
            type: 'pretty',
            requestReplay: debugMode,
        },
        preferLocalImplementation: true,
        strict: true,
        thenable: false,
    })
}
// #endregion

// #region Setup GeneratorServices
import { decryptionWithSocialNetworkDecoding } from './crypto/decryption'
{
    const GeneratorService: GeneratorServices = {
        decryption: decryptionWithSocialNetworkDecoding,
    }
    import.meta.webpackHot &&
        import.meta.webpackHot.accept(['./crypto/decryption'], async () => {
            GeneratorService.decryption = (await import('./crypto/decryption')).decryptionWithSocialNetworkDecoding
        })
    const channel = message.events.GeneratorService.bind(MessageTarget.Broadcast)

    if (debugMode) {
        Reflect.defineProperty(globalThis, 'GeneratorService', { configurable: true, value: GeneratorService })
    }

    AsyncGeneratorCall(GeneratorService, {
        key: 'GeneratorService',
        serializer,
        channel,
        log: {
            beCalled: false,
            remoteError: false,
            type: 'pretty',
            requestReplay: false,
        },
        preferLocalImplementation: true,
        strict: true,
        thenable: false,
    })
}
// #endregion
