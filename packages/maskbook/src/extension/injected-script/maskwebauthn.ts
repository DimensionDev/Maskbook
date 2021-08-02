'use strict'

import { createCredentialsContainer } from '@dimensiondev/mask-webauthn/api'
import { AsyncCall, JSONSerialization } from 'async-call-rpc'

const channel = {
    on(listener: Function) {
        const l = (x: Event) => x instanceof CustomEvent && listener(x.detail)
        document.addEventListener('mask-logout', l)
        return function removeMaskLogoutListener() {
            document.removeEventListener('mask-logout', l)
        }
    },
    send(message: string) {
        document.dispatchEvent(new CustomEvent('mask-in', { detail: message }))
    },
}

const server = AsyncCall<{
    version: () => number
    maskWebAuthnGet: (...args: any[]) => any
    maskWebAuthnCreate: (...args: any[]) => any
}>({}, { channel, serializer: JSONSerialization() })

async function init() {
    await untilStart()
    const currentVersion = await server.version()
    if (currentVersion < 2) {
        throw new Error('not support mask webauthn')
    }
    console.log('masklogin support!')
    console.log('see `globalThis.masklogin`')
    return server
    function untilStart() {
        if (document.querySelector('html')?.getAttribute('data-mask-sdk-ready')) {
            return Promise.resolve()
        }
        return new Promise((resolve) => document.addEventListener('mask-start', resolve, { once: true }))
    }
}

const rpc = init()

const { get, create } = createCredentialsContainer({
    publicKeyAuthenticator: {
        create(...args: any[]) {
            return rpc.then((server) => {
                return server.maskWebAuthnGet(...args)
            })
        },
        get(...args: any[]) {
            return rpc.then((server) => {
                return server.maskWebAuthnCreate(...args)
            })
        },
    },
})

Object.defineProperty(globalThis, 'masklogin', {
    value: Object.freeze({
        create,
        get,
    }),
    writable: false,
})
