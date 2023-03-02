// Notice, this module itself is not HMR ready.
// If you change this file to add a new service, you need to reload.
// This file should not rely on any other in-project files unless it is HMR ready.
/// <reference types="../env.d.ts" />

import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { assertEnvironment, Environment, MessageTarget, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { getLocalImplementation, serializer } from '@masknet/shared-base'
import type { GeneratorServices, Services } from './types.js'
// #endregion

// #region Setup GeneratorServices
import { decryptionWithSocialNetworkDecoding } from './crypto/decryption.js'
assertEnvironment(Environment.ManifestBackground)

const debugMode = process.env.NODE_ENV === 'development' || process.env.engine === 'safari'
const message = new WebExtensionMessage<Record<string, any>>({ domain: '$' })
const hmr = new EventTarget()

// #region Setup services
setup('Crypto', () => import(/* webpackPreload: true */ './crypto/index.js'))
setup('Identity', () => import(/* webpackPreload: true */ './identity/index.js'))
setup('Backup', () => import(/* webpackPreload: true */ './backup/index.js'))
setup('Helper', () => import(/* webpackPreload: true */ './helper/index.js'))
setup('SiteAdaptor', () => import(/* webpackPreload: true */ './site-adaptors/index.js'))
setup('Settings', () => import(/* webpackPreload: true */ './settings/index.js'), false)
setup('ThirdPartyPlugin', () => import(/* webpackPreload: true */ './third-party-plugins/index.js'))

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept(['./crypto'], () => hmr.dispatchEvent(new Event('crypto')))
    import.meta.webpackHot.accept(['./identity'], () => hmr.dispatchEvent(new Event('identity')))
    import.meta.webpackHot.accept(['./backup'], () => hmr.dispatchEvent(new Event('backup')))
    import.meta.webpackHot.accept(['./helper'], () => hmr.dispatchEvent(new Event('helper')))
    import.meta.webpackHot.accept(['./settings'], () => hmr.dispatchEvent(new Event('settings')))
    import.meta.webpackHot.accept(['./site-adaptors'], () => hmr.dispatchEvent(new Event('socialNetwork')))
    import.meta.webpackHot.accept(['./third-party-plugins'], () => hmr.dispatchEvent(new Event('thirdPartyPlugin')))
}

function setup<K extends keyof Services>(key: K, implementation: () => Promise<Services[K]>, hasLog = true) {
    const channel = message.events[key].bind(MessageTarget.Broadcast)

    async function load() {
        const val = await getLocalImplementation(true, `Services.${key}`, implementation, channel)
        if (debugMode) {
            Reflect.defineProperty(globalThis, key + 'Service', { configurable: true, enumerable: true, value: val })
        }
        return val
    }
    if (import.meta.webpackHot) hmr.addEventListener(key, load)

    // setup server
    AsyncCall(load(), {
        key,
        serializer,
        channel,
        log: hasLog
            ? {
                  beCalled: true,
                  remoteError: false,
                  type: 'pretty',
                  requestReplay: debugMode,
              }
            : false,
        strict: true,
        thenable: false,
    })
}
{
    const GeneratorService: GeneratorServices = {
        decryption: decryptionWithSocialNetworkDecoding,
    }
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    import.meta.webpackHot &&
        import.meta.webpackHot.accept(['./crypto/decryption'], async () => {
            GeneratorService.decryption = (
                await import(/* webpackPreload: true */ './crypto/decryption.js')
            ).decryptionWithSocialNetworkDecoding
        })
    const channel = message.events.GeneratorServices.bind(MessageTarget.Broadcast)

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
