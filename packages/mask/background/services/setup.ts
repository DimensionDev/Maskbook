// Notice, this module itself is not HMR ready.
// If you change this file to add a new service, you need to reload.
// This file should not rely on any other in-project files unless it is HMR ready.
/// <reference path="../env.d.ts" />

import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { assertEnvironment, Environment, MessageTarget, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { getOrUpdateLocalImplementationHMR, encoder, setDebugObject } from '@masknet/shared-base'
import type { GeneratorServices, Services } from './types.js'

import { decryptWithDecoding } from './crypto/decryption.js'
assertEnvironment(Environment.ManifestBackground)

const debugMode = process.env.NODE_ENV === 'development'
const message = new WebExtensionMessage<Record<string, any>>({ domain: '$' })
const hmr = new EventTarget()

const DebugService = Object.create(null)
export function startServices() {
    setup('Crypto', () => import(/* webpackMode: 'eager' */ './crypto/index.js'))
    setup('Identity', () => import(/* webpackMode: 'eager' */ './identity/index.js'))
    setup('Backup', () => import(/* webpackMode: 'eager' */ './backup/index.js'))
    setup('Helper', () => import(/* webpackMode: 'eager' */ './helper/index.js'))
    setup('SiteAdaptor', () => import(/* webpackMode: 'eager' */ './site-adaptors/index.js'))
    setup('Settings', () => import(/* webpackMode: 'eager' */ './settings/index.js'), false)
    setup('Wallet', () => import(/* webpackMode: 'eager' */ './wallet/services/index.js'))
    if (import.meta.webpackHot) {
        import.meta.webpackHot.accept(['./crypto'], () => hmr.dispatchEvent(new Event('Crypto')))
        import.meta.webpackHot.accept(['./identity'], () => hmr.dispatchEvent(new Event('Identity')))
        import.meta.webpackHot.accept(['./backup'], () => hmr.dispatchEvent(new Event('Backup')))
        import.meta.webpackHot.accept(['./helper'], () => hmr.dispatchEvent(new Event('Helper')))
        import.meta.webpackHot.accept(['./settings'], () => hmr.dispatchEvent(new Event('Settings')))
        import.meta.webpackHot.accept(['./site-adaptors'], () => hmr.dispatchEvent(new Event('SiteAdaptor')))
        import.meta.webpackHot.accept(['./wallet/services'], () => hmr.dispatchEvent(new Event('Wallet')))
    }
    setDebugObject('Service', DebugService)

    const GeneratorService: GeneratorServices = {
        decrypt: decryptWithDecoding,
    }
    import.meta.webpackHot?.accept(['./crypto/decryption'], async () => {
        GeneratorService.decrypt = (
            await import(/* webpackMode: 'eager' */ './crypto/decryption.js')
        ).decryptWithDecoding
    })
    const channel = message.events.GeneratorServices.bind(MessageTarget.Broadcast)
    setDebugObject('GeneratorService', GeneratorService)

    AsyncGeneratorCall(GeneratorService, {
        key: 'GeneratorService',
        encoder,
        channel: {
            on: (c) => channel.on((d) => c(d)),
            send: (d) => channel.send(d),
        },
        log: {
            beCalled: false,
            remoteError: false,
            type: 'pretty',
            requestReplay: false,
        },
        preferLocalImplementation: true,
        thenable: false,
    })
}

function setup<K extends keyof Services>(key: K, implementation: () => Promise<Services[K]>, hasLog = true) {
    const channel = message.events[key].bind(MessageTarget.Broadcast)

    async function load() {
        const val = await getOrUpdateLocalImplementationHMR(implementation, channel)
        DebugService[key] = val
        return val
    }
    if (import.meta.webpackHot) hmr.addEventListener(key, load)

    // setup server
    AsyncCall(load(), {
        key,
        encoder,
        channel: {
            on: (c) => channel.on((d) => c(d)),
            send: (d) => channel.send(d),
        },
        log:
            hasLog ?
                {
                    beCalled: true,
                    remoteError: false,
                    type: 'pretty',
                    requestReplay: debugMode,
                }
            :   false,
        thenable: false,
    })
}
