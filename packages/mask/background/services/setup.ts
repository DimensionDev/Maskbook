// Notice, this module itself is not HMR ready.
// If you change this file to add a new service, you need to reload.
// This file should not rely on any other in-project files unless it is HMR ready.
import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { assertEnvironment, Environment, MessageTarget, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { getLocalImplementation, serializer } from '@masknet/shared-base'
import type { GeneratorServices, Services } from './types'
assertEnvironment(Environment.ManifestBackground)

const SERVICE_HMR_EVENT = 'service-hmr'
const message = new WebExtensionMessage<Record<string, any>>({ domain: 'services' })

//#region Setup services
const _service: Record<keyof Services, void> = {
    Crypto: setup('Crypto', () => import('./crypto')),
}
const _service_generator: Record<keyof GeneratorServices, void> = {}

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept(['./crypto'], () => globalThis.dispatchEvent(new Event(SERVICE_HMR_EVENT)))
}
//#endregion

function setup(key: keyof Services, implementation: () => Promise<any>, isGenerator = false) {
    const serviceChannel = message.events[key].bind(MessageTarget.Broadcast)
    const loadService = async () => {
        const val = await getLocalImplementation(true, `Services.${key}`, implementation, serviceChannel)
        if (process.env.NODE_ENV === 'development') {
            Reflect.defineProperty(globalThis, key + 'Service', { configurable: true, value: val })
        }
        console.log(`Service ${key} loaded.`)
        return val
    }
    if (process.env.NODE_ENV === 'development') {
        Reflect.defineProperty(globalThis, key + 'Services', {
            configurable: true,
            get() {
                console.log('Loading service ' + key)
                loadService()
            },
        })
    }
    if (import.meta.webpackHot) globalThis.addEventListener(SERVICE_HMR_EVENT, loadService)
    ;(isGenerator ? AsyncGeneratorCall : AsyncCall)(loadService, {
        key,
        serializer,
        log: {
            beCalled: false,
            localError: true,
            remoteError: false,
            sendLocalStack: false,
            type: 'pretty',
            requestReplay: process.env.NODE_ENV === 'development',
        },
        channel: serviceChannel,
        preferLocalImplementation: true,
        strict: true,
        thenable: false,
    })
}
